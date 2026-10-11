import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('@/app/blog/api', () => ({ getBlogEntries: m.getBlogEntries }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('@/app/blog/routes/BlogIndexRoute', () => ({ default: () => null }));

import TagPage, { generateMetadata } from './page';

const props = {
  params: Promise.resolve({ tag: encodeURIComponent('日本語') }),
};

beforeEach(() => vi.clearAllMocks());

describe('/blog/tag/[tag]', () => {
  it('メタデータにデコードしたタグを渡す', async () => {
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(props);
    expect(m.getMetadata).toHaveBeenCalledWith({
      blog: 'blog',
      tag: ['日本語'],
    });
  });

  it('デコードしたタグで記事を取得し、tag を Route に渡す', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [{ id: 1 }],
      pager: { pages: [{ page: 1, path: '/' }] },
    });
    const el = await TagPage(props);
    expect(m.getBlogEntries).toHaveBeenCalledWith({ tag: ['日本語'] });
    expect(el.props.tag).toBe('日本語');
    expect(el.props.pagination.currentPage).toBe(1);
    expect(el.props.pagination.pages).toEqual([{ page: 1, path: '/' }]);
  });

  it('pager が無ければ pages は空配列', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    const el = await TagPage(props);
    expect(el.props.pagination.pages).toEqual([]);
  });
});
