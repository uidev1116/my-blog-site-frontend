import { expect, it, vi } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
});

import robots from './robots';

it('全許可と sitemap の URL を返す', () => {
  expect(robots()).toEqual({
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://example.com/sitemap.xml',
  });
});
