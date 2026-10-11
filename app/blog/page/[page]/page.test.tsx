import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('@/app/blog/api', () => ({ getBlogEntries: m.getBlogEntries }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('@/app/blog/routes/BlogIndexRoute', () => ({ default: () => null }));

import BlogIndexPage, { generateMetadata, generateStaticParams } from './page';

const params = (page: string) => ({ params: Promise.resolve({ page }) });

beforeEach(() => vi.clearAllMocks());

describe('/blog/page/[page]', () => {
  it('メタデータにページ番号を渡す', async () => {
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(params('3'));
    expect(m.getMetadata).toHaveBeenCalledWith({ blog: 'blog', page: 3 });
  });

  it('静的パラメータは first〜last ページを列挙する', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [],
      pager: { firstPage: 1, lastPage: 3 },
    });
    expect(await generateStaticParams()).toEqual([
      { page: '1' },
      { page: '2' },
      { page: '3' },
    ]);
  });

  it('pager が無ければ 1 ページだけ', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    expect(await generateStaticParams()).toEqual([{ page: '1' }]);
  });

  it('指定ページの記事を取得して現在ページを渡す', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [{ id: 1 }],
      pager: { pages: [{ page: 2, path: '/x' }] },
    });
    const el = await BlogIndexPage(params('2'));
    expect(m.getBlogEntries).toHaveBeenCalledWith({ page: 2 });
    expect(el.props.pagination.currentPage).toBe(2);
    expect(el.props.pagination.pages).toEqual([{ page: 2, path: '/x' }]);
  });

  it('pager が無ければ pages は空配列', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    const el = await BlogIndexPage(params('1'));
    expect(el.props.pagination.pages).toEqual([]);
  });
});
