import { describe, expect, it } from 'vitest';
import buildSearchPagination from './buildSearchPagination';

const pager = {
  firstPage: 1,
  lastPage: 3,
  previous: { path: '/blog/page/1/', num: 10, page: 1 },
  pages: [
    { page: 1, path: '/blog/page/1/' },
    { page: 2, path: '/blog/page/2/' },
    { page: 3, path: '/blog/page/3/' },
  ],
  next: { path: '/blog/page/3/', num: 10, page: 3 },
};

describe('buildSearchPagination', () => {
  it('ページ番号から、検索ページの URL(?keyword=...&page=N)を組み立てる', () => {
    const result = buildSearchPagination(pager, 'a b', 2);

    expect(result.currentPage).toBe(2);
    expect(result.pages.map((p) => p.path)).toEqual([
      '/blog/search/?keyword=a%20b&page=1',
      '/blog/search/?keyword=a%20b&page=2',
      '/blog/search/?keyword=a%20b&page=3',
    ]);
    expect(result.previous?.path).toBe('/blog/search/?keyword=a%20b&page=1');
    expect(result.next?.path).toBe('/blog/search/?keyword=a%20b&page=3');
  });

  it('a-blog cms が返したブログ一覧の URL(/blog/page/N/)を使わない', () => {
    const result = buildSearchPagination(pager, 'cms', 1);

    const paths = [
      ...result.pages.map((p) => p.path),
      result.previous?.path,
      result.next?.path,
    ];
    expect(paths.some((p) => p?.startsWith('/blog/page/'))).toBe(false);
  });

  it('前後のページが無ければ previous / next を返さない', () => {
    const result = buildSearchPagination(
      { ...pager, previous: undefined, next: undefined },
      'cms',
      1,
    );

    expect(result.previous).toBeUndefined();
    expect(result.next).toBeUndefined();
  });

  it('pager が無ければ、ページ一覧は空', () => {
    const result = buildSearchPagination(undefined, 'cms', 1);

    expect(result.pages).toEqual([]);
    expect(result.currentPage).toBe(1);
  });

  it('keyword が空でも URL を組み立てられる', () => {
    const result = buildSearchPagination(pager, '', 1);

    expect(result.pages[0].path).toBe('/blog/search/?keyword=&page=1');
  });
});
