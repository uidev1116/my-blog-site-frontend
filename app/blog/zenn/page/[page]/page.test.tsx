import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getZennArticles: vi.fn(),
  getMetadata: vi.fn(),
}));
vi.mock('../../api', () => ({ getZennArticles: m.getZennArticles }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('../../routes/ZennArticleIndexRoute', () => ({ default: () => null }));

import ZennArticlesPage, {
  generateMetadata,
  generateStaticParams,
} from './page';

const props = { params: Promise.resolve({ page: '2' }) };

beforeEach(() => vi.clearAllMocks());

describe('/blog/zenn/page/[page]', () => {
  it('メタデータにページ番号を渡す', async () => {
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(props);
    expect(m.getMetadata).toHaveBeenCalledWith({
      blog: 'blog',
      category: 'zenn',
      page: 2,
    });
  });

  it('静的パラメータは nextPage が null になるまでのページ数分', async () => {
    m.getZennArticles
      .mockResolvedValueOnce({ articles: [], nextPage: 2 })
      .mockResolvedValueOnce({ articles: [], nextPage: 3 })
      .mockResolvedValueOnce({ articles: [], nextPage: null });
    expect(await generateStaticParams()).toEqual([
      { page: '1' },
      { page: '2' },
      { page: '3' },
    ]);
    expect(m.getZennArticles).toHaveBeenCalledTimes(3);
  });

  it('記事が 1 ページだけなら 1 件', async () => {
    m.getZennArticles.mockResolvedValue({ articles: [], nextPage: null });
    expect(await generateStaticParams()).toEqual([{ page: '1' }]);
  });

  it('指定ページの記事を Route に渡す', async () => {
    m.getZennArticles.mockResolvedValue({ articles: [{ id: 1 }], nextPage: 3 });
    const el = await ZennArticlesPage(props);
    expect(m.getZennArticles).toHaveBeenCalledWith(2);
    expect(el.props).toEqual({ articles: [{ id: 1 }], nextPage: 3, page: 2 });
  });
});
