import {
  Container,
  EmptyState,
  EntryList,
  Pagination,
  TabList,
  Tab,
} from '@/app/components';
import { getBlogEntries } from './api';
import { Metadata } from 'next';
import { getMetadata } from '../api';
import { Suspense } from 'react';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata({ blog: 'blog' });
}

export default async function BlogIndexPage() {
  const { entries, pager } = await getBlogEntries();

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
                      <div className="flex justify-center">
                        <Pagination
                          currentPage={1}
                          previous={pager?.previous}
                          pages={pager?.pages}
                          next={pager.next}
                        />
                      </div>
                    )}
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
