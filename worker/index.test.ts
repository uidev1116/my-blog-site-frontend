import { beforeEach, describe, expect, it, vi } from 'vitest';

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
});
