import { ZennArticle } from '@/app/types';

const ZENN_URL = 'https://zenn.dev';
const ZENN_API_HOST = `${ZENN_URL}/api/`;
const ZENN_USER_NAME = '';

export type ZennArticleResponse = {
  articles: ZennArticle[];
  nextPage: number | null;
};

export async function getZennArticles(
  page: number = 1,
): Promise<ZennArticleResponse> {
  const searchParams = new URLSearchParams({
    username: ZENN_USER_NAME,
    order: 'latest',
    count: '10',
    page: page.toString(),
  });
  const endpoint = new URL(`${ZENN_API_HOST}articles/?${searchParams}`);
  const res = await fetch(endpoint, { next: { revalidate: 3600 } });
  const { articles, next_page } = await res.json();

  return {
    articles: articles.map((article: any) => ({
      id: article.id,
      postType: article.post_type,
      title: article.title,
      slug: article.slug,
      publishedAt: new Date(article.published_at),
      articleType: article.article_type,
      emoji: article.emoji,
      url: `${ZENN_URL}${article.path}`,
    })),
    nextPage: next_page,
  };
}
