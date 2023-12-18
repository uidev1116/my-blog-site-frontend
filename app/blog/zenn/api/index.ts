import { ZennArticle } from '@/app/types';
import { utcToZonedTime } from 'date-fns-tz';

const ZENN_URL = 'https://zenn.dev';
const ZENN_API_HOST = `${ZENN_URL}/api/`;
const ZENN_USER_NAME = 'uidev1116';

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
  const res = await fetch(endpoint, {
    next: {
      revalidate: 3600,
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const { articles, next_page } = await res.json();

  return {
    articles: articles.map((article: any) => ({
      id: article.id,
      postType: article.post_type,
      title: article.title,
      slug: article.slug,
      publishedAt: utcToZonedTime(new Date(article.published_at), 'Asia/Tokyo'),
      articleType: article.article_type,
      emoji: article.emoji,
      url: `${ZENN_URL}${article.path}`,
    })),
    nextPage: next_page,
  };
}
