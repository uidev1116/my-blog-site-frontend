import { expect, it, vi } from 'vitest';

const { getBlogEntries } = vi.hoisted(() => ({ getBlogEntries: vi.fn() }));
vi.mock('@/app/blog/api', () => ({ getBlogEntries }));

import { GET } from './route';

it('検索パラメータを渡して entries を JSON で返す', async () => {
  getBlogEntries.mockResolvedValue({ entries: [{ id: 1 }], pager: {} });

  const res = await GET(new Request('https://example.com/api/blog?page=2'));

  const { searchParams } = getBlogEntries.mock.calls[0][0];
  expect(searchParams.get('page')).toBe('2');
  expect(await res.json()).toEqual({ entries: [{ id: 1 }] });
});
