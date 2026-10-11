import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('@/app/blog/api', () => ({ getBlogEntries: m.getBlogEntries }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('./routes/BlogIndexRoute', () => ({ default: () => null }));

import BlogIndexPage, { generateMetadata } from './page';

beforeEach(() => vi.clearAllMocks());

describe('/blog', () => {
  it('メタデータは blog を対象に取得する', async () => {
    m.getMetadata.mockResolvedValue({ title: 't' });
    expect(await generateMetadata()).toEqual({ title: 't' });
    expect(m.getMetadata).toHaveBeenCalledWith({ blog: 'blog' });
  });

  it('1 ページ目として entries とページャーを渡す', async () => {
    const previous = { path: '/p', num: 1, page: 1 };
    const next = { path: '/n', num: 1, page: 2 };
    const pages = [{ page: 1, path: '/' }];
    m.getBlogEntries.mockResolvedValue({
      entries: [{ id: 1 }],
      pager: { previous, pages, next },
    });

    const el = await BlogIndexPage();
    expect(el.props).toEqual({
      entries: [{ id: 1 }],
      pagination: { currentPage: 1, previous, pages, next },
    });
  });

  it('pager が無ければ pages は空配列', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    const el = await BlogIndexPage();
    expect(el.props.pagination).toEqual({
      currentPage: 1,
      previous: undefined,
      pages: [],
      next: undefined,
    });
  });
});
