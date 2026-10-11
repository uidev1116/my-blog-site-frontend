import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getBlogEntry = vi.fn();
const getTagRelationalEntries = vi.fn();
vi.mock('@/app/blog/api', () => ({
  getBlogEntry,
  getTagRelationalEntries,
  getBlogEntries: vi.fn(),
}));
vi.mock('@/app/config/acms', () => ({ PREVIEW_KEY: 'secret-preview-key' }));

const entry = {
  id: 1,
  code: 'draft.html',
  title: '下書きの記事',
  path: '/blog/draft.html/',
  createdAt: new Date('2026-01-02T03:04:05Z'),
  body: '<p>本文</p>',
};
const related = [
  { id: 2, code: 'b.html', title: '関連記事', path: '/blog/b.html/' },
];

// 実装と同じ方法(HMAC-SHA256、'token:' + payload)で、任意の payload に署名する。
// 署名が正しいのに、中身が不正なトークンを作って、検証の順序を確かめる
const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
async function signedToken(payloadText: string) {
  const payload = b64url(new TextEncoder().encode(payloadText));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('secret-preview-key'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`token:${payload}`),
    ),
  );
  return { payload, token: `${payload}.${b64url(sig)}` };
}
const withCookie = (token: string) => ({
  headers: { Cookie: `__Secure-preview=${token}` },
});

async function call(path: string, init?: RequestInit) {
  const { default: worker } = await import('./index');
  return worker.fetch(new Request(`https://example.com${path}`, init));
}

// /api/blog/draft を呼んで、発行された Cookie(name=value の部分)を取り出す
async function issueCookie(code = 'draft.html') {
  const res = await call(
    `/api/blog/draft/?previewKey=secret-preview-key&code=${code}`,
  );
  const setCookie = res.headers.get('Set-Cookie') ?? '';
  return { res, setCookie, cookie: setCookie.split(';')[0] };
}

describe('worker: GET /api/blog/draft(プレビューの開始)', () => {
  beforeEach(() => {
    getBlogEntry.mockReset();
    getBlogEntry.mockResolvedValue(entry);
    getTagRelationalEntries.mockReset();
    getTagRelationalEntries.mockResolvedValue(related);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('キーが正しければ、プレビューページに 302 でリダイレクトし、Cookie を発行する', async () => {
    const { res, setCookie } = await issueCookie();

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/blog/preview/?code=draft.html');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/api/blog/preview');
    expect(setCookie).toMatch(/Max-Age=\d+/);
  });

  it('Cookie に、プレビューキーそのものを含めない', async () => {
    const { setCookie } = await issueCookie();

    expect(setCookie).not.toContain('secret-preview-key');
  });

  it('下書きを取得するため、プレビュー指定で記事を確認する', async () => {
    await issueCookie();

    expect(getBlogEntry).toHaveBeenCalledWith('draft.html', true);
  });

  it('previewKey が無ければ 400', async () => {
    const res = await call('/api/blog/draft/?code=draft.html');

    expect(res.status).toBe(400);
  });

  it('code が無ければ 400', async () => {
    const res = await call('/api/blog/draft/?previewKey=secret-preview-key');

    expect(res.status).toBe(400);
  });

  it.each(['../etc', 'a/b', 'a b', 'a?b', 'a#b', '', 'あ'])(
    '不正な code(%s)は 400',
    async (code) => {
      const res = await call(
        `/api/blog/draft/?previewKey=secret-preview-key&code=${encodeURIComponent(code)}`,
      );

      expect(res.status).toBe(400);
      expect(getBlogEntry).not.toHaveBeenCalled();
    },
  );

  it('previewKey が違えば 401(a-blog cms は呼ばない、Cookie も発行しない)', async () => {
    const res = await call(
      '/api/blog/draft/?previewKey=wrong-key&code=draft.html',
    );

    expect(res.status).toBe(401);
    expect(res.headers.get('Set-Cookie')).toBeNull();
    expect(getBlogEntry).not.toHaveBeenCalled();
  });

  it('previewKey の一部だけ一致しても 401', async () => {
    const res = await call(
      '/api/blog/draft/?previewKey=secret-preview-ke&code=draft.html',
    );

    expect(res.status).toBe(401);
  });

  it('記事が見つからなければ 404(Cookie は発行しない)', async () => {
    getBlogEntry.mockResolvedValue(null);

    const res = await call(
      '/api/blog/draft/?previewKey=secret-preview-key&code=none.html',
    );

    expect(res.status).toBe(404);
    expect(res.headers.get('Set-Cookie')).toBeNull();
  });

  it('a-blog cms が失敗したら、詳細を含めず 502', async () => {
    getBlogEntry.mockRejectedValue(new Error('secret upstream detail'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call(
      '/api/blog/draft/?previewKey=secret-preview-key&code=draft.html',
    );

    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain('secret upstream detail');
  });

  it('a-blog cms が 404 を返す(存在しない記事)なら、502 ではなく 404', async () => {
    getBlogEntry.mockRejectedValue(new Error('fetch API response status: 404'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call(
      '/api/blog/draft/?previewKey=secret-preview-key&code=none.html',
    );

    expect(res.status).toBe(404);
  });

  it.each(['.', '..', '...'])(
    'code が "%s"(ドットだけ)なら 400',
    async (code) => {
      const res = await call(
        `/api/blog/draft/?previewKey=secret-preview-key&code=${code}`,
      );

      expect(res.status).toBe(400);
      expect(getBlogEntry).not.toHaveBeenCalled();
    },
  );

  it('HEAD では Cookie を発行せず、a-blog cms も呼ばない(405)', async () => {
    const res = await call(
      '/api/blog/draft/?previewKey=secret-preview-key&code=draft.html',
      { method: 'HEAD' },
    );

    expect(res.status).toBe(405);
    expect(res.headers.get('Set-Cookie')).toBeNull();
    expect(getBlogEntry).not.toHaveBeenCalled();
  });

  it('Cookie 名に __Secure- プレフィックスを付ける(兄弟サブドメインからの上書きを防ぐ)', async () => {
    const { setCookie } = await issueCookie();

    expect(setCookie.startsWith('__Secure-preview=')).toBe(true);
  });

  it('エラーのログに、プレビューキーを含めない', async () => {
    getBlogEntry.mockRejectedValue(
      new Error('upstream failed for key secret-preview-key'),
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    await call(
      '/api/blog/draft/?previewKey=secret-preview-key&code=draft.html',
    );

    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
      'secret-preview-key',
    );
  });

  it('レスポンスに、MIME の推測と Referer の送信を止めるヘッダーを付ける', async () => {
    const res = await call('/api/blog/draft/?previewKey=wrong&code=draft.html');

    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('no-referrer');
  });

  it('GET 以外は 405', async () => {
    const res = await call(
      '/api/blog/draft/?previewKey=secret-preview-key&code=draft.html',
      { method: 'POST' },
    );

    expect(res.status).toBe(405);
  });
});

describe('worker: GET /api/blog/preview(下書きの取得)', () => {
  beforeEach(() => {
    getBlogEntry.mockReset();
    getBlogEntry.mockResolvedValue(entry);
    getTagRelationalEntries.mockReset();
    getTagRelationalEntries.mockResolvedValue(related);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('有効な Cookie があれば、下書きの記事と関連記事を返す(キャッシュさせない)', async () => {
    const { cookie } = await issueCookie();
    getBlogEntry.mockClear();

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    const body = await res.json();
    expect(body.entry.title).toBe('下書きの記事');
    expect(body.entry.createdAt).toBe('2026-01-02T03:04:05.000Z');
    expect(body.relationalEntries).toHaveLength(1);
    expect(getBlogEntry).toHaveBeenCalledWith('draft.html', true);
    expect(getTagRelationalEntries).toHaveBeenCalledWith('draft.html', true);
  });

  it('Cookie が無ければ 401(a-blog cms は呼ばない)', async () => {
    getBlogEntry.mockClear();

    const res = await call('/api/blog/preview/?code=draft.html');

    expect(res.status).toBe(401);
    expect(getBlogEntry).not.toHaveBeenCalled();
  });

  it('Cookie の署名が改ざんされていれば 401', async () => {
    const { cookie } = await issueCookie();
    const tampered = `${cookie.slice(0, -2)}xx`;

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: tampered },
    });

    expect(res.status).toBe(401);
  });

  it('別の記事の code では、その Cookie を使えない', async () => {
    const { cookie } = await issueCookie('draft.html');

    const res = await call('/api/blog/preview/?code=other.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(401);
  });

  it('有効期限(30 分)を過ぎたら 401', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { cookie } = await issueCookie();

    vi.setSystemTime(new Date('2026-01-01T00:30:01Z'));
    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(401);
  });

  it('有効期限の直前なら使える', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { cookie } = await issueCookie();

    vi.setSystemTime(new Date('2026-01-01T00:29:59Z'));
    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);
  });

  it('他の Cookie と一緒に送られても、プレビューの Cookie を見つける', async () => {
    const { cookie } = await issueCookie();

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: `theme=dark; ${cookie}; other=1` },
    });

    expect(res.status).toBe(200);
  });

  it('code が無い、または不正なら 400', async () => {
    const { cookie } = await issueCookie();

    expect(
      (await call('/api/blog/preview/', { headers: { Cookie: cookie } }))
        .status,
    ).toBe(400);
    expect(
      (
        await call('/api/blog/preview/?code=a%2Fb', {
          headers: { Cookie: cookie },
        })
      ).status,
    ).toBe(400);
  });

  it('記事が見つからなければ 404', async () => {
    const { cookie } = await issueCookie();
    getBlogEntry.mockResolvedValue(null);

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(404);
  });

  it('a-blog cms が失敗したら、詳細を含めず 502', async () => {
    const { cookie } = await issueCookie();
    getBlogEntry.mockRejectedValue(new Error('secret upstream detail'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain('secret upstream detail');
  });

  describe('不正なトークン', () => {
    it('署名は正しいが、有効なトークンの形式・内容(code, 数値の e)を満たす場合は、使える(対照)', async () => {
      const { token } = await signedToken(
        JSON.stringify({
          c: 'draft.html',
          e: Math.floor(Date.now() / 1000) + 600,
        }),
      );

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(token),
      );

      expect(res.status).toBe(200);
    });

    it('署名は正しいが、有効期限 e が文字列なら 401', async () => {
      const { token } = await signedToken(
        JSON.stringify({ c: 'draft.html', e: '99999999999' }),
      );

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(token),
      );

      expect(res.status).toBe(401);
    });

    it('署名は正しいが、payload が JSON でなければ 401', async () => {
      const { token } = await signedToken('not json');

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(token),
      );

      expect(res.status).toBe(401);
    });

    it('署名の長さが違えば 401', async () => {
      const { payload } = await signedToken(
        JSON.stringify({ c: 'draft.html', e: 99999999999 }),
      );

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(`${payload}.AAAA`),
      );

      expect(res.status).toBe(401);
    });

    it('署名が base64url として不正なら 401', async () => {
      const { payload } = await signedToken(
        JSON.stringify({ c: 'draft.html', e: 99999999999 }),
      );

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(`${payload}.!!!!`),
      );

      expect(res.status).toBe(401);
    });

    it('"." が複数あれば 401', async () => {
      const { token } = await signedToken(
        JSON.stringify({ c: 'draft.html', e: 99999999999 }),
      );

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(`${token}.extra`),
      );

      expect(res.status).toBe(401);
    });

    it('署名はそのままで、payload だけ差し替えたら 401', async () => {
      const { cookie } = await issueCookie('draft.html');
      const signature = cookie.split('=')[1].split('.')[1];
      const forged = await signedToken(
        JSON.stringify({ c: 'draft.html', e: 99999999999 }),
      );

      const res = await call(
        '/api/blog/preview/?code=draft.html',
        withCookie(`${forged.payload}.${signature}`),
      );

      expect(res.status).toBe(401);
    });
  });

  it('関連記事の取得だけが失敗したら、詳細を含めず 502', async () => {
    const { cookie } = await issueCookie();
    getTagRelationalEntries.mockRejectedValue(new Error('secret upstream'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain('secret upstream');
  });

  it('a-blog cms が 404 を返す(存在しない記事)なら 404', async () => {
    const { cookie } = await issueCookie();
    getBlogEntry.mockRejectedValue(new Error('fetch API response status: 404'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call('/api/blog/preview/?code=draft.html', {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(404);
  });

  it('code が "." や ".." なら 400', async () => {
    const { cookie } = await issueCookie();

    for (const code of ['.', '..']) {
      const res = await call(`/api/blog/preview/?code=${code}`, {
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(400);
    }
  });
});

describe('worker: プレビューキーが未設定のとき', () => {
  it('/api/blog/draft/ は 503、/api/blog/preview/ は 401(Cookie を信用しない)', async () => {
    vi.resetModules();
    vi.doMock('@/app/config/acms', () => ({ PREVIEW_KEY: '' }));
    vi.doMock('@/app/blog/api', () => ({
      getBlogEntry,
      getTagRelationalEntries,
      getBlogEntries: vi.fn(),
    }));
    const { default: worker } = await import('./index');

    const draft = await worker.fetch(
      new Request(
        'https://example.com/api/blog/draft/?previewKey=x&code=a.html',
      ),
    );
    const preview = await worker.fetch(
      new Request('https://example.com/api/blog/preview/?code=a.html', {
        headers: { Cookie: '__Secure-preview=a.b' },
      }),
    );

    expect(draft.status).toBe(503);
    expect(preview.status).toBe(401);
    vi.doUnmock('@/app/config/acms');
    vi.resetModules();
  });
});
