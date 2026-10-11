import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getBlogEntries = vi.fn();
vi.mock('@/app/blog/api', () => ({ getBlogEntries }));

const entry = {
  id: 1,
  code: 'a.html',
  sort: 1,
  csort: 1,
  usort: 1,
  status: 'open',
  title: '記事A',
  path: '/blog/a.html/',
  isNew: false,
  createdAt: new Date('2026-01-02T03:04:05Z'),
  summary: '概要',
  tags: [{ name: 'tag', path: '/blog/tag/tag/' }],
};
const pager = {
  firstPage: 1,
  lastPage: 2,
  pages: [
    { page: 1, path: '/blog/' },
    { page: 2, path: '/blog/page/2/' },
  ],
  next: { path: '/blog/page/2/', num: 10, page: 2 },
};

async function call(path: string, init?: RequestInit) {
  const { default: worker } = await import('./index');
  return worker.fetch(new Request(`https://example.com${path}`, init));
}

describe('worker: GET /api/blog', () => {
  beforeEach(() => {
    getBlogEntries.mockReset();
    getBlogEntries.mockResolvedValue({ entries: [entry], pager });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('検索結果を JSON で返す(日付は ISO 文字列)', async () => {
    const res = await call('/api/blog/?keyword=cms');

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    const body = await res.json();
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].title).toBe('記事A');
    expect(body.entries[0].createdAt).toBe('2026-01-02T03:04:05.000Z');
    expect(body.pager.lastPage).toBe(2);
  });

  it('keyword を a-blog cms に渡す', async () => {
    await call('/api/blog/?keyword=cms');

    const arg = getBlogEntries.mock.calls[0][0];
    expect(new URLSearchParams(arg.searchParams).get('keyword')).toBe('cms');
    expect(arg.page).toBeUndefined();
  });

  it('page を a-blog cms に渡す', async () => {
    await call('/api/blog/?keyword=cms&page=2');

    expect(getBlogEntries.mock.calls[0][0].page).toBe(2);
  });

  it('末尾スラッシュなしの /api/blog も受け付ける', async () => {
    const res = await call('/api/blog?keyword=cms');

    expect(res.status).toBe(200);
  });

  it('keyword と page 以外のクエリは a-blog cms に渡さない', async () => {
    await call('/api/blog/?keyword=cms&api=ogp&foo=bar');

    const arg = getBlogEntries.mock.calls[0][0];
    expect([...new URLSearchParams(arg.searchParams).keys()]).toEqual([
      'keyword',
    ]);
  });

  it.each(['abc', '0', '-1', '1.5', '1000001'])(
    'page=%s は 400 を返す',
    async (page) => {
      const res = await call(`/api/blog/?keyword=cms&page=${page}`);

      expect(res.status).toBe(400);
      expect(getBlogEntries).not.toHaveBeenCalled();
    },
  );

  it('長すぎる keyword は 400 を返す', async () => {
    const res = await call(`/api/blog/?keyword=${'a'.repeat(201)}`);

    expect(res.status).toBe(400);
    expect(getBlogEntries).not.toHaveBeenCalled();
  });

  it('a-blog cms が失敗したら、内部の詳細を含めず 502 を返す', async () => {
    getBlogEntries.mockRejectedValue(new Error('secret upstream detail'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call('/api/blog/?keyword=cms');

    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain('secret upstream detail');
  });

  it('GET 以外は 405 を返す', async () => {
    const res = await call('/api/blog/?keyword=cms', { method: 'POST' });

    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET, HEAD');
  });

  it('存在しない /api/* は 404 を返す', async () => {
    const res = await call('/api/unknown/');

    expect(res.status).toBe(404);
    expect((await res.json()).error).toBeTruthy();
  });

  it('成功したレスポンスは、ブラウザで 60 秒キャッシュできる', async () => {
    const res = await call('/api/blog/?keyword=cms');

    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60');
  });

  it.each([
    ['/api/blog/?page=abc', undefined],
    ['/api/unknown/', undefined],
    ['/api/blog/', { method: 'POST' }],
  ])('エラーレスポンス(%s)は、キャッシュさせない', async (path, init) => {
    const res = await call(path, init);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('502 のレスポンスも、キャッシュさせない', async () => {
    getBlogEntries.mockRejectedValue(new Error('upstream'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call('/api/blog/?keyword=cms');

    expect(res.status).toBe(502);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('HEAD も 200 を返す', async () => {
    const res = await call('/api/blog/?keyword=cms', { method: 'HEAD' });

    expect(res.status).toBe(200);
  });

  it('page の上限(1000000)は通り、先頭が 0 の数字は弾く', async () => {
    expect((await call('/api/blog/?page=1000000')).status).toBe(200);
    expect((await call('/api/blog/?page=01')).status).toBe(400);
  });

  it('keyword はちょうど 200 文字まで通る', async () => {
    const res = await call(`/api/blog/?keyword=${'a'.repeat(200)}`);

    expect(res.status).toBe(200);
  });

  it('keyword が無ければ、空文字として a-blog cms に渡す', async () => {
    await call('/api/blog/');

    const arg = getBlogEntries.mock.calls[0][0];
    expect(new URLSearchParams(arg.searchParams).get('keyword')).toBe('');
  });

  it('範囲外の page(a-blog cms が 404 を返す)は、結果 0 件として 200 で返す', async () => {
    getBlogEntries.mockRejectedValue(
      new Error('fetch API response status: 404'),
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await call('/api/blog/?keyword=cms&page=999');

    expect(res.status).toBe(200);
    expect((await res.json()).entries).toEqual([]);
    expect(errorLog).not.toHaveBeenCalled();
  });

  describe('エッジのキャッシュ(Cache API)', () => {
    function stubCache(cached?: Response) {
      const cache = {
        match: vi.fn().mockResolvedValue(cached),
        put: vi.fn().mockResolvedValue(undefined),
      };
      vi.stubGlobal('caches', { default: cache });
      return cache;
    }

    it('キャッシュに無ければ a-blog cms から取得して、保存する', async () => {
      const cache = stubCache();

      const res = await call('/api/blog/?keyword=cms&page=2');

      expect(res.status).toBe(200);
      expect(getBlogEntries).toHaveBeenCalledTimes(1);
      expect(cache.put).toHaveBeenCalledTimes(1);
    });

    it('キャッシュにあれば a-blog cms を呼ばずに返す', async () => {
      stubCache(
        new Response(JSON.stringify({ entries: [], cached: true }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }),
      );

      const res = await call('/api/blog/?keyword=cms');

      expect((await res.json()).cached).toBe(true);
      expect(getBlogEntries).not.toHaveBeenCalled();
    });

    it('同じ検索は、URL の書き方(末尾スラッシュ、余計なクエリ)が違っても同じキーにする', async () => {
      const cache = stubCache();

      await call('/api/blog?keyword=cms&foo=1');
      await call('/api/blog/?keyword=cms');

      const keys = cache.match.mock.calls.map((c) => c[0].url);
      expect(keys[0]).toBe(keys[1]);
    });

    it('エラーレスポンスは保存しない', async () => {
      const cache = stubCache();
      getBlogEntries.mockRejectedValue(new Error('upstream'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await call('/api/blog/?keyword=cms');

      expect(cache.put).not.toHaveBeenCalled();
    });

    it('Cache API が失敗しても、検索結果は返す', async () => {
      const cache = stubCache();
      cache.match.mockRejectedValue(new Error('cache down'));
      cache.put.mockRejectedValue(new Error('cache down'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await call('/api/blog/?keyword=cms');

      expect(res.status).toBe(200);
    });
  });
});
