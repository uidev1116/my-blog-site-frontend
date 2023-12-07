import Link from 'next/link';
import {
  Pagination,
  Badge,
  Container,
  EmptyState,
  EntryList,
  TabList,
  Tab,
} from '@/app/components';
import { getBlogEntries } from '../../../../api';
import { range } from '@/app/utils';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { Suspense } from 'react';

type Props = {
  params: { tag: string; page: string };
};

export async function generateMetadata({
  params: { tag, page },
}: Props): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    page: parseInt(page, 10),
    tag: [decodeURIComponent(tag)],
  });
}

export async function generateStaticParams({
  params: { tag },
}: {
  params: { tag: string };
}) {
  const { pager } = await getBlogEntries({ tag: [decodeURIComponent(tag)] });
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndexPage({
  params: { tag, page },
}: {
  params: { tag: string; page: string };
}) {
  const tagName = decodeURIComponent(tag);
  const { entries, pager } = await getBlogEntries({
    tag: [tagName],
    page: parseInt(page, 10),
  });

  if (entries.length === 0) {
    return (
      <Container>
        <main>
          <EmptyState />
        </main>
      </Container>
    );
  }

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
                    <div className="mb-4 flex items-center justify-between">
                      <div className="m-1 inline-flex flex-1">
                        <span>
                          <span className="text-sm">タグ:</span>
                        </span>
                        <span className="inline-flex flex-1 flex-wrap items-center gap-2 px-3 py-0.5 text-sm">
                          <span>
                            <Badge>#{tagName}</Badge>
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-700 hover:text-primary-darkest">
                          <Link href="/blog/">全て表示する</Link>
                        </span>
                      </div>
                    </div>
                  </div>
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
      </main>
    </Container>
  );
}
