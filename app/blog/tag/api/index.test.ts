import { expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/app/lib/acms', () => ({ default: { get } }));

import { getAllBlogTags } from './index';

it('タグ名の配列を返す', async () => {
  get.mockResolvedValue({
    data: { 'tag:loop': [{ name: 'a' }, { name: 'b' }] },
  });
  expect(await getAllBlogTags()).toEqual(['a', 'b']);
});

it('タグが無ければ空配列', async () => {
  get.mockResolvedValue({ data: {} });
  expect(await getAllBlogTags()).toEqual([]);
});
