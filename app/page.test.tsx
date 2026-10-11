import { expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getBlogEntries: vi.fn(), getMetadata: vi.fn() }));
vi.mock('@/app/api', () => m);
vi.mock('@/app/routes/HomeRoute', () => ({ default: () => null }));

import HomePage, { generateMetadata } from './page';

it('メタデータはルートの設定を返す', async () => {
  m.getMetadata.mockResolvedValue({ title: 't' });
  expect(await generateMetadata()).toEqual({ title: 't' });
  expect(m.getMetadata).toHaveBeenCalledWith();
});

it('最新記事を HomeRoute に渡す', async () => {
  m.getBlogEntries.mockResolvedValue({
    indexPath: '/blog/',
    indexBlogName: 'ブログ',
    entries: [{ id: 1 }],
  });
  const el = await HomePage();
  expect(el.props).toEqual({
    blogPath: '/blog/',
    blogName: 'ブログ',
    entries: [{ id: 1 }],
  });
});
