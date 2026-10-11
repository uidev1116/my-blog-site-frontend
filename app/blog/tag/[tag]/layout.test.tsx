import { expect, it, vi } from 'vitest';

const getAllBlogTags = vi.hoisted(() => vi.fn());
vi.mock('@/app/blog/tag/api', () => ({ getAllBlogTags }));

import TagLayout, { generateStaticParams } from './layout';

it('静的パラメータは全タグ', async () => {
  getAllBlogTags.mockResolvedValue(['a', 'b']);
  expect(await generateStaticParams()).toEqual([{ tag: 'a' }, { tag: 'b' }]);
});

it('children をそのまま返す', () => {
  const el = TagLayout({ children: 'x' });
  expect(el.props.children).toBe('x');
});
