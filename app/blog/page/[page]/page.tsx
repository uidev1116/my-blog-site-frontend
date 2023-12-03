import {
  Container,
  EmptyState,
  EntryList,
  Pagination,
  Tab,
  TabList,
} from '@/app/components';
import { range } from '@/app/utils';
import { getBlogEntries } from '../../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { Suspense } from 'react';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  return await getMetadata({ blog: 'blog', page: parseInt(params.page, 10) });
}

export async function generateStaticParams() {
  const { pager } = await getBlogEntries();
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndexPage({
  params,
}: {
  params: { page: string };
}) {
  const { page } = params;
  const { entries, pager } = await getBlogEntries({ page: parseInt(page, 10) });

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
                        <Pagination
                          currentPage={parseInt(page, 10)}
                          previous={pager?.previous}
                          pages={pager?.pages}
                          next={pager.next}
                        />
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
