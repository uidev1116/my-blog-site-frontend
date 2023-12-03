import {
  Container,
  EmptyState,
  EntryList,
  Pagination,
  Tab,
  TabList,
} from '@/app/components';
import { getBlogEntries } from '../../../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { objToSearchParams } from '@/app/utils';
import { acmsPath } from '@/app/lib/acms/lib/acmsPath';
import { Suspense } from 'react';
import Link from 'next/link';

type Props = {
  params: { page: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    page: parseInt(params.page, 10),
    searchParams: objToSearchParams(searchParams),
  });
}

export default async function BlogSearchPage({ params, searchParams }: Props) {
  const { page } = params;
  const { entries, pager } = await getBlogEntries({
    page: parseInt(page, 10),
    searchParams: objToSearchParams(searchParams),
  });

  const paginationProps = {
    currentPage: parseInt(page, 10),
    previous: pager?.previous && {
      ...pager.previous,
      path: `/blog/search/${acmsPath({ page: pager.previous.page })}`,
    },
    pages:
      pager?.pages.map((page) => ({
        ...page,
        path: `/blog/search/${acmsPath({ page: page.page })}`,
      })) || [],
    next: pager?.next && {
      ...pager.next,
      path: `/blog/search/${acmsPath({ page: pager.next.page })}`,
    },
  };

  return (
    <Container>
      <main>
        <div>
          <div className="flex flex-col gap-10">
            <TabList>
              <Tab>
                <Link
                  href="/blog/"
                  className="inline-block rounded-t-lg border-b-2 border-primary p-4"
                  aria-current="page"
                >
                  Blog
                </Link>
              </Tab>
              <Tab>
                <Link
                  href="/blog/zenn/"
                  className="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Zenn
                </Link>
              </Tab>
            </TabList>
            <div>
              {entries.length > 0 ? (
                <div className="flex flex-col gap-12">
                  <div>
                    <EntryList entries={entries} />
                  </div>
                  {pager !== undefined && pager.pages.length > 0 && (
                    <Suspense>
                      <div className="flex justify-center">
                        <Pagination {...paginationProps} />
                      </div>
                    </Suspense>
                  )}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}
