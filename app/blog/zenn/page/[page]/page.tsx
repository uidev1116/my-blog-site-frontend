import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { getZennArticles } from '../../api';
import { range } from '@/app/utils';
import ZennArticleIndexRoute from '../../routes/ZennArticleIndexRoute';

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    category: 'zenn',
    page: parseInt(params.page, 10),
  });
}

async function getZennArticlesPageAmount() {
  let pageAmount = 1;
  while (true) {
    const { nextPage } = await getZennArticles(pageAmount);
    if (nextPage === null) {
      break;
    }
    pageAmount++;
  }
  return pageAmount;
}

export async function generateStaticParams() {
  const pageAmount = await getZennArticlesPageAmount();

  return range(1, pageAmount).map((page) => ({
    page: page.toString(),
  }));
}

export default async function ZennArticlesPage({
  params,
}: {
  params: { page: string };
}) {
  const page = parseInt(params.page, 10);
  const { articles, nextPage } = await getZennArticles(page);

  return (
    <ZennArticleIndexRoute
      articles={articles}
      nextPage={nextPage}
      page={page}
    />
  );
}
