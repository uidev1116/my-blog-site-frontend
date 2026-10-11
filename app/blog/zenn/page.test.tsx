import { expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getZennArticles: vi.fn(),
  getMetadata: vi.fn(),
}));
vi.mock('./api', () => ({ getZennArticles: m.getZennArticles }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('./routes/ZennArticleIndexRoute', () => ({ default: () => null }));

import ZennArticlesPage, { generateMetadata } from './page';

it('メタデータは zenn カテゴリを対象に取得する', async () => {
  m.getMetadata.mockResolvedValue({});
  await generateMetadata();
  expect(m.getMetadata).toHaveBeenCalledWith({
    blog: 'blog',
    category: 'zenn',
  });
});

it('記事と次ページを Route に渡す', async () => {
  m.getZennArticles.mockResolvedValue({ articles: [{ id: 1 }], nextPage: 2 });
  const el = await ZennArticlesPage();
  expect(el.props).toEqual({ articles: [{ id: 1 }], nextPage: 2 });
});
