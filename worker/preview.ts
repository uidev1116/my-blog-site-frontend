import { getBlogEntry, getTagRelationalEntries } from '@/app/blog/api';
import { PREVIEW_KEY } from '@/app/config/acms';
import { isAcmsNotFoundError } from '@/app/utils';
import { SECURITY_HEADERS, json } from './http';

// 下書きのプレビュー。
//   1. GET /api/blog/draft/?previewKey=...&code=...  キーと記事を確認し、署名付きの Cookie を発行して
//      プレビューページ(/blog/preview/?code=...)にリダイレクトする(a-blog cms のプレビューリンクはこの URL)
//   2. GET /api/blog/preview/?code=...  Cookie を検証して、下書きの記事と関連記事を返す
// プレビューキーはブラウザの JavaScript には渡さず、Cookie にも含めない(HMAC の鍵として使う)

// __Secure- を付けて、HTTPS 以外や兄弟サブドメインからの上書きを防ぐ
const COOKIE_NAME = '__Secure-preview';
const COOKIE_PATH = '/api/blog/preview';
const TTL_SECONDS = 30 * 60;
const CODE_PATTERN = /^[A-Za-z0-9._~-]{1,200}$/;

// '.' や '..' だけの code は、a-blog cms のパスとして解釈されうるため弾く
function isValidCode(code: string) {
  return CODE_PATTERN.test(code) && !/^\.+$/.test(code);
}

// ログには、エラーのメッセージだけを出す(プレビューキーは伏せる)
function describeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return PREVIEW_KEY ? message.split(PREVIEW_KEY).join('***') : message;
}

const encoder = new TextEncoder();

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(data)),
  );
}

// 長さが同じ前提で、先頭から比較を打ち切らずに照合する
function safeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

// プレビューキーが一致するか(HMAC のダイジェスト同士を、一定時間で比較する)
async function isValidPreviewKey(provided: string) {
  const [a, b] = await Promise.all([
    hmac(PREVIEW_KEY, `key:${provided}`),
    hmac(PREVIEW_KEY, `key:${PREVIEW_KEY}`),
  ]);
  return safeEqual(a, b);
}

async function signToken(code: string, expiresAt: number) {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ c: code, e: expiresAt })),
  );
  const signature = toBase64Url(await hmac(PREVIEW_KEY, `token:${payload}`));
  return `${payload}.${signature}`;
}

async function verifyToken(token: string, code: string) {
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length > 0) {
    return false;
  }
  const given = fromBase64Url(signature);
  if (!given) {
    return false;
  }
  const expected = await hmac(PREVIEW_KEY, `token:${payload}`);
  if (!safeEqual(given, expected)) {
    return false;
  }
  const decoded = fromBase64Url(payload);
  if (!decoded) {
    return false;
  }
  try {
    const { c, e } = JSON.parse(new TextDecoder().decode(decoded));
    return c === code && typeof e === 'number' && e * 1000 > Date.now();
  } catch {
    return false;
  }
}

function readCookie(request: Request, name: string) {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) {
      return value.join('=');
    }
  }
  return null;
}

function isConfigured() {
  return typeof PREVIEW_KEY === 'string' && PREVIEW_KEY !== '';
}

export async function handleDraft(url: URL) {
  const code = url.searchParams.get('code') ?? '';
  const previewKey = url.searchParams.get('previewKey') ?? '';

  if (!isValidCode(code)) {
    return json({ error: 'code is invalid' }, 400);
  }
  if (previewKey === '') {
    return json({ error: 'previewKey is required' }, 400);
  }
  if (!isConfigured()) {
    return json({ error: 'Preview is not configured' }, 503);
  }
  if (!(await isValidPreviewKey(previewKey))) {
    return json({ error: 'previewKey is invalid' }, 401);
  }

  try {
    const entry = await getBlogEntry(code, true);
    if (!entry) {
      return json({ error: 'Entry not found' }, 404);
    }
  } catch (error) {
    // 存在しない記事は、a-blog cms が 404 を返す
    if (isAcmsNotFoundError(error)) {
      return json({ error: 'Entry not found' }, 404);
    }
    console.error('failed to fetch draft entry', describeError(error));
    return json({ error: 'Bad Gateway' }, 502);
  }

  const token = await signToken(
    code,
    Math.floor(Date.now() / 1000) + TTL_SECONDS,
  );
  return new Response(null, {
    status: 302,
    headers: {
      // 遷移先は固定のパス + code(オープンリダイレクトにならない)
      Location: `/blog/preview/?code=${encodeURIComponent(code)}`,
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      'Set-Cookie': `${COOKIE_NAME}=${token}; Max-Age=${TTL_SECONDS}; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

export async function handlePreview(request: Request, url: URL) {
  const code = url.searchParams.get('code') ?? '';
  if (!isValidCode(code)) {
    return json({ error: 'code is invalid' }, 400);
  }

  const token = readCookie(request, COOKIE_NAME);
  if (!isConfigured() || !token || !(await verifyToken(token, code))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const [entry, relationalEntries] = await Promise.all([
      getBlogEntry(code, true),
      getTagRelationalEntries(code, true),
    ]);
    if (!entry) {
      return json({ error: 'Entry not found' }, 404);
    }
    return json({ entry, relationalEntries }, 200, {
      'Cache-Control': 'private, no-store',
    });
  } catch (error) {
    if (isAcmsNotFoundError(error)) {
      return json({ error: 'Entry not found' }, 404);
    }
    console.error('failed to fetch preview entry', describeError(error));
    return json({ error: 'Bad Gateway' }, 502);
  }
}
