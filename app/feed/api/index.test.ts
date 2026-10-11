import { expect, it, vi } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
});
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/app/lib/acms', () => ({ default: { get } }));

import { getRssFeed } from './index';

it('フィードを BASE_URL 基準の URL に変換する', async () => {
  get.mockResolvedValue({
    data: {
      lastBuildDate: '2026-01-02T00:00:00Z',
      'item:loop': [
        {
          title: 't',
          link: 'https://cms.example.com/blog/a.html',
          permalink: 'https://cms.example.com/blog/a.html?x=1',
          pubDate: '2026-01-01T00:00:00Z',
          category: 'c',
          creator: 'me',
        },
      ],
    },
  });

  const feed = await getRssFeed({ blog: 'blog' } as never);

  expect(get.mock.calls[0][0]).toEqual({ blog: 'blog', api: 'feed' });
  expect(feed).toEqual({
    lastBuildDate: new Date('2026-01-02T00:00:00Z'),
    items: [
      {
        title: 't',
        link: 'https://example.com/blog/a.html',
        permalink: 'https://example.com/blog/a.html',
        pubDate: new Date('2026-01-01T00:00:00Z'),
        category: 'c',
        creator: 'me',
      },
    ],
  });
});

it('記事が無ければ items は空配列', async () => {
  get.mockResolvedValue({ data: { lastBuildDate: '2026-01-02T00:00:00Z' } });
  expect((await getRssFeed()).items).toEqual([]);
});
