import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('@/app/blog/api', () => ({ getBlogEntries: m.getBlogEntries }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('@/app/blog/routes/BlogIndexRoute', () => ({ default: () => null }));

import BlogSearchPage, { generateMetadata } from './page';

const props = {
  params: Promise.resolve({ page: '2' }),
  searchParams: Promise.resolve({ keyword: 'a' }),
};

beforeEach(() => vi.clearAllMocks());

describe('/blog/search/page/[page]', () => {
  it('メタデータにページ番号と検索パラメータを渡す', async () => {
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(props);
    const arg = m.getMetadata.mock.calls[0][0];
    expect(arg.page).toBe(2);
    expect(arg.searchParams.get('keyword')).toBe('a');
  });

  it('現在ページを渡し、ページャーのパスを付け替える', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [],
      pager: {
        previous: { path: '/x', num: 1, page: 1 },
        pages: [{ page: 1, path: '/x' }],
        next: { path: '/x', num: 1, page: 3 },
      },
    });
    const el = await BlogSearchPage(props);
    expect(m.getBlogEntries.mock.calls[0][0].page).toBe(2);
    expect(el.props.pagination).toEqual({
      currentPage: 2,
      previous: { path: '/blog/search/', num: 1, page: 1 },
      pages: [{ page: 1, path: '/blog/search/' }],
      next: { path: '/blog/search/page/3/', num: 1, page: 3 },
    });
  });

  it('pager が無ければ pages は空配列', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    const el = await BlogSearchPage(props);
    expect(el.props.pagination.pages).toEqual([]);
    expect(el.props.pagination.previous).toBeUndefined();
  });
});
