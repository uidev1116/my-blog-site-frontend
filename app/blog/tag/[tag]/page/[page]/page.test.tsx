import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('@/app/blog/api', () => ({ getBlogEntries: m.getBlogEntries }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('@/app/blog/routes/BlogIndexRoute', () => ({ default: () => null }));

import TagPage, { generateMetadata, generateStaticParams } from './page';

const tag = encodeURIComponent('日本語');
const props = { params: Promise.resolve({ tag, page: '2' }) };

beforeEach(() => vi.clearAllMocks());

describe('/blog/tag/[tag]/page/[page]', () => {
  it('メタデータにページとデコードしたタグを渡す', async () => {
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(props);
    expect(m.getMetadata).toHaveBeenCalledWith({
      blog: 'blog',
      page: 2,
      tag: ['日本語'],
    });
  });

  it('静的パラメータはタグごとの first〜last ページ', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [],
      pager: { firstPage: 1, lastPage: 2 },
    });
    expect(await generateStaticParams({ params: { tag } })).toEqual([
      { page: '1' },
      { page: '2' },
    ]);
    expect(m.getBlogEntries).toHaveBeenCalledWith({ tag: ['日本語'] });
  });

  it('pager が無ければ 1 ページだけ', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    expect(await generateStaticParams({ params: { tag } })).toEqual([
      { page: '1' },
    ]);
  });

  it('タグとページで記事を取得して Route に渡す', async () => {
    m.getBlogEntries.mockResolvedValue({
      entries: [],
      pager: { pages: [{ page: 2, path: '/x' }] },
    });
    const el = await TagPage(props);
    expect(m.getBlogEntries).toHaveBeenCalledWith({ tag: ['日本語'], page: 2 });
    expect(el.props.tag).toBe('日本語');
    expect(el.props.pagination.currentPage).toBe(2);
    expect(el.props.pagination.pages).toEqual([{ page: 2, path: '/x' }]);
  });

  it('pager が無ければ pages は空配列', async () => {
    m.getBlogEntries.mockResolvedValue({ entries: [] });
    const el = await TagPage(props);
    expect(el.props.pagination.pages).toEqual([]);
  });
});
