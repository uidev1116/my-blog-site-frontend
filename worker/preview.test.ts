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
});
