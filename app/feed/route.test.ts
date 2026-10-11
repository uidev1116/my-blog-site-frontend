import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
vi.stubEnv('ACMS_ASSETS_PROTOCOL', 'https');
vi.stubEnv('ACMS_ASSETS_HOSTNAME', 'assets.example.com');
vi.stubEnv('ACMS_ASSETS_PORT', '');

const getOgp = vi.fn();
const getRssFeed = vi.fn();
vi.mock('../api', () => ({ getOgp }));
vi.mock('./api', () => ({ getRssFeed }));

describe('GET /feed', () => {
  beforeEach(() => {
    getOgp.mockResolvedValue({
      title: 'サイト名',
      description: 'サイトの説明',
      keywords: '',
    });
    getRssFeed.mockResolvedValue({
      lastBuildDate: new Date('2026-01-01T00:00:00Z'),
      items: [
        {
          title: '記事タイトル',
          link: 'https://example.com/blog/a.html',
          permalink: 'https://example.com/blog/a.html',
          pubDate: new Date('2026-01-01T00:00:00Z'),
          category: 'cat',
          creator: 'uidev1116',
        },
      ],
    });
  });

  it('RSS 2.0 の XML を返す', async () => {
    const { GET } = await import('./route');
    const res = await GET();

    expect(res.headers.get('Content-Type')).toBe(
      'application/xml; charset=utf-8',
    );
    const xml = await res.text();
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<title>サイト名</title>');
    expect(xml).toContain('<title><![CDATA[記事タイトル]]></title>');
    expect(xml).toContain('https://example.com/blog/a.html');
    expect(xml).toContain('<category>cat</category>');
  });

  it('記事が 0 件でも XML を返す', async () => {
    getRssFeed.mockResolvedValue({
      lastBuildDate: new Date('2026-01-01T00:00:00Z'),
      items: [],
    });
    const { GET } = await import('./route');
    const xml = await (await GET()).text();

    expect(xml).toContain('<rss version="2.0"');
    expect(xml).not.toContain('<item>');
  });
});
