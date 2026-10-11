import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBlogEntries } from './client';

const entryJson = {
  id: 1,
  code: 'a.html',
  sort: 1,
  csort: 1,
  usort: 1,
  status: 'open',
  title: '記事A',
  path: '/blog/a.html/',
  isNew: false,
  createdAt: '2026-01-02T03:04:05.000Z',
  updatedAt: '2026-02-02T03:04:05.000Z',
  summary: '概要',
  tags: [{ name: 'tag', path: '/blog/tag/tag/' }],
};
const pager = { firstPage: 1, lastPage: 2, pages: [] };

function mockFetch(response: Partial<Response> & { json?: () => unknown }) {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ entries: [entryJson], pager }),
    ...response,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('fetchBlogEntries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keyword と page を /api/blog/ に渡す', async () => {
    const fn = mockFetch({});

    await fetchBlogEntries({ keyword: 'a b', page: 2 });

    const url = new URL(fn.mock.calls[0][0], 'https://example.com');
    expect(url.pathname).toBe('/api/blog/');
    expect(url.searchParams.get('keyword')).toBe('a b');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('page を省略したら、page パラメーターを付けない', async () => {
    const fn = mockFetch({});

    await fetchBlogEntries({ keyword: 'cms' });

    const url = new URL(fn.mock.calls[0][0], 'https://example.com');
    expect(url.searchParams.has('page')).toBe(false);
  });

  it('JSON の日付文字列を Date に戻す', async () => {
    mockFetch({});

    const { entries, pager: p } = await fetchBlogEntries({ keyword: 'cms' });

    expect(entries[0].createdAt).toBeInstanceOf(Date);
    expect(entries[0].createdAt.toISOString()).toBe('2026-01-02T03:04:05.000Z');
    expect(entries[0].updatedAt).toBeInstanceOf(Date);
    expect(entries[0].title).toBe('記事A');
    expect(p?.lastPage).toBe(2);
  });

  it('レスポンスが失敗(ok でない)なら例外を投げる', async () => {
    mockFetch({ ok: false, status: 502 });

    await expect(fetchBlogEntries({ keyword: 'cms' })).rejects.toThrow(
      'Failed to fetch entries (502)',
    );
  });
});
