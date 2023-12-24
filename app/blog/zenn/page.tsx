import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { getZennArticles } from './api';
import ZennArticleIndexRoute from './routes/ZennArticleIndexRoute';

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata({ blog: 'blog', category: 'zenn' });
}

export default async function ZennArticlesPage() {
  const { articles, nextPage } = await getZennArticles();

  return <ZennArticleIndexRoute articles={articles} nextPage={nextPage} />;
}
