import { expect, it, vi } from 'vitest';

const { getSitemap } = vi.hoisted(() => ({ getSitemap: vi.fn() }));
vi.mock('./api', () => ({ getSitemap }));

import sitemap from './sitemap';

it('API のサイトマップをそのまま返す', async () => {
  const data = [{ url: 'https://example.com/', lastModified: '2026-01-01' }];
  getSitemap.mockResolvedValue(data);
  expect(await sitemap()).toBe(data);
});
