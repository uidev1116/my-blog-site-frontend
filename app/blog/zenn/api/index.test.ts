import { afterEach, describe, expect, it, vi } from 'vitest';
import { getZennArticles } from './index';

const fetchMock = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('getZennArticles', () => {
  it('Zenn API を呼び出して記事を変換する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: [
          {
            id: 1,
            post_type: 'Article',
            title: 'タイトル',
            slug: 'slug',
            published_at: '2026-01-01T00:00:00Z',
            article_type: 'tech',
            emoji: '🎉',
            path: '/uidev1116/articles/slug',
          },
        ],
        next_page: 2,
      }),
    });

    const res = await getZennArticles(1);

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.origin + url.pathname).toBe('https://zenn.dev/api/articles/');
    expect(url.searchParams.get('username')).toBe('uidev1116');
    expect(url.searchParams.get('page')).toBe('1');
    expect(res).toEqual({
      articles: [
        {
          id: 1,
          postType: 'Article',
          title: 'タイトル',
          slug: 'slug',
          publishedAt: new Date('2026-01-01T00:00:00Z'),
          articleType: 'tech',
          emoji: '🎉',
          url: 'https://zenn.dev/uidev1116/articles/slug',
        },
      ],
      nextPage: 2,
    });
  });

  it('ページ未指定なら 1 ページ目を取得する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ articles: [], next_page: null }),
    });

    const res = await getZennArticles();

    expect((fetchMock.mock.calls[0][0] as URL).searchParams.get('page')).toBe(
      '1',
    );
    expect(res).toEqual({ articles: [], nextPage: null });
  });

  it('レスポンスが ok でなければ例外を投げる', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({ ok: false });
    await expect(getZennArticles()).rejects.toThrow('Failed to fetch data');
  });
});
