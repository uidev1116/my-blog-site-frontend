import {
  Container,
  EmptyState,
  TabList,
  Tab,
  ZennArticleList,
} from '@/app/components';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import Link from 'next/link';
import { getZennArticles } from '../../api';

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

export default async function ZennArticlesPage({
  params,
}: {
  params: { page: string };
}) {
  const page = parseInt(params.page, 10);
  const prevPage = page > 2 ? page - 1 : null;
  const { articles, nextPage } = await getZennArticles(page);

  return (
    <Container>
      <main>
        <div>
          <div>
            <div className="flex flex-col gap-10">
              <TabList>
                <Tab>
                  <Link
                    href="/blog/"
                    className="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Blog
                  </Link>
                </Tab>
                <Tab>
                  <Link
                    href="/blog/zenn/"
                    className="inline-block rounded-t-lg border-b-2 border-primary border-transparent p-4"
                    aria-current="page"
                  >
                    Zenn
                  </Link>
                </Tab>
              </TabList>
              <div>
                {articles.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    <div>
                      <ZennArticleList articles={articles} />
                    </div>
                    <div className="flex justify-end">
                      <Link
                        href={`/blog/zenn/${
                          prevPage ? `page/${prevPage}` : ''
                        }`}
                        className="me-3 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <svg
                          className="me-2 h-3.5 w-3.5 rtl:rotate-180"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5H1m0 0 4 4M1 5l4-4"
                          />
                        </svg>
                        前へ
                      </Link>
                      {nextPage != null && (
                        <Link
                          href={`/blog/zenn/page/${nextPage}`}
                          className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          次へ
                          <svg
                            className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}
