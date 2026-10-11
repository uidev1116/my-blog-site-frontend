import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('../api', () => ({ getBlogEntries: m.getBlogEntries }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('../routes/BlogIndexRoute', () => ({ default: () => null }));

import BlogSearchPage, { dynamic, generateMetadata } from './page';

const props = (q: Record<string, string | string[]> = { keyword: 'a' }) => ({
  searchParams: Promise.resolve(q),
});

beforeEach(() => vi.clearAllMocks());

describe('/blog/search', () => {
  it('常に動的レンダリング', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('メタデータに検索パラメータを渡す', async () => {
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(props());
    const arg = m.getMetadata.mock.calls[0][0];
    expect(arg.blog).toBe('blog');
    expect(arg.searchParams.get('keyword')).toBe('a');
  });

  it('ページャーのパスを検索ページ用に付け替える', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [{ id: 1 }],
      pager: {
        previous: { path: '/old', num: 1, page: 1 },
        pages: [
          { page: 1, path: '/old' },
          { page: 2, path: '/old2' },
        ],
        next: { path: '/old', num: 1, page: 2 },
      },
    });

    const el = await BlogSearchPage(props());

    expect(m.getBlogEntries.mock.calls[0][0].searchParams.get('keyword')).toBe(
      'a',
    );
    expect(el.props.pagination).toEqual({
      currentPage: 1,
      previous: { path: '/blog/search/', num: 1, page: 1 },
      pages: [
        { page: 1, path: '/blog/search/' },
        { page: 2, path: '/blog/search/page/2/' },
      ],
      next: { path: '/blog/search/page/2/', num: 1, page: 2 },
    });
  });

  it('pager が無ければ pages は空配列', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    const el = await BlogSearchPage(props());
    expect(el.props.pagination).toEqual({
      currentPage: 1,
      previous: undefined,
      pages: [],
      next: undefined,
    });
  });
});
