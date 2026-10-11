import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchError, fetchBlogEntries, fetchPreviewEntry } from './client';

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

  it('失敗したときの例外は、HTTP ステータスを持つ', async () => {
    mockFetch({ ok: false, status: 400 });

    const error = await fetchBlogEntries({ keyword: 'cms' }).catch((e) => e);

    expect(error).toBeInstanceOf(FetchError);
    expect(error.status).toBe(400);
  });

  it('日付が null(JSON で値が無い)なら undefined にする', async () => {
    mockFetch({
      json: async () => ({
        entries: [{ ...entryJson, startAt: null, endAt: null }],
      }),
    });

    const { entries } = await fetchBlogEntries({ keyword: 'cms' });

    expect(entries[0].startAt).toBeUndefined();
    expect(entries[0].endAt).toBeUndefined();
  });
});

describe('fetchPreviewEntry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const related = [{ ...entryJson, id: 2, code: 'b.html', title: '関連記事' }];

  it('code を /api/blog/preview/ に渡し、記事と関連記事の日付を Date に戻す', async () => {
    const fn = mockFetch({
      json: async () => ({ entry: entryJson, relationalEntries: related }),
    });

    const result = await fetchPreviewEntry('draft.html');

    const url = new URL(fn.mock.calls[0][0], 'https://example.com');
    expect(url.pathname).toBe('/api/blog/preview/');
    expect(url.searchParams.get('code')).toBe('draft.html');
    expect(result.entry.createdAt).toBeInstanceOf(Date);
    expect(result.relationalEntries[0].createdAt).toBeInstanceOf(Date);
    expect(result.relationalEntries[0].title).toBe('関連記事');
  });

  it('Cookie を送る(同一オリジンの認証用 Cookie)', async () => {
    const fn = mockFetch({
      json: async () => ({ entry: entryJson, relationalEntries: [] }),
    });

    await fetchPreviewEntry('draft.html');

    expect(fn.mock.calls[0][1]?.credentials).toBe('same-origin');
  });

  it.each([401, 404, 502])(
    'ステータス %i は FetchError で投げる',
    async (status) => {
      mockFetch({ ok: false, status });

      const error = await fetchPreviewEntry('draft.html').catch((e) => e);

      expect(error).toBeInstanceOf(FetchError);
      expect(error.status).toBe(status);
    },
  );
});
