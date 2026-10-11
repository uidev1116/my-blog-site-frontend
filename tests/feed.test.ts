import { Feed } from 'feed';
import { describe, expect, it } from 'vitest';

// app/feed/route.ts が使っている feed の API(コンストラクタ・addItem・rss2)の互換性を確認する
describe('feed', () => {
  it('RSS 2.0 を生成できる', () => {
    const feed = new Feed({
      title: 'タイトル',
      description: '説明',
      id: 'https://example.com',
      link: 'https://example.com',
      copyright: '© 2023 example.com',
      updated: new Date('2026-01-01T00:00:00Z'),
      generator: 'a-blog cms',
      author: {
        name: 'name',
        email: 'a@example.com',
        link: 'https://example.com/profile/',
      },
    });
    feed.addItem({
      title: '記事',
      id: 'https://example.com/blog/a.html',
      link: 'https://example.com/blog/a.html',
      category: [{ name: 'cat' }],
      author: [
        {
          name: 'name',
          email: 'a@example.com',
          link: 'https://example.com/profile/',
        },
      ],
      date: new Date('2026-01-01T00:00:00Z'),
    });

    const xml = feed.rss2();

    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<title>タイトル</title>');
    expect(xml).toContain('https://example.com/blog/a.html');
    expect(xml).toContain('<category>cat</category>');
  });
});
