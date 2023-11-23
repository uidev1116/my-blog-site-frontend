import Link from 'next/link';
import {
  Pagination,
  Badge,
  Container,
  EmptyState,
  EntryList,
} from '@/app/components';
import { getBlogEntries } from '../../api';
import { getAllBlogTags } from '../api';
import { Metadata } from 'next';
import { getOGP } from '@/app/api';
import { acmsPath } from '@/app/lib/acmsPath';
import { Suspense } from 'react';

type Props = {
  params: { tag: string };
};

export async function generateMetadata({
  params: { tag },
}: Props): Promise<Metadata> {
  const tagName = decodeURIComponent(tag);
  const { openGraph, ...rest } = await getOGP({
    blog: 'blog',
    tag: [tagName],
  });

  return {
    ...rest,
    openGraph: {
      ...openGraph,
      type: 'website',
    },
    robots: {
      index: false,
    },
  };
}

export async function generateStaticParams() {
  const tags = await getAllBlogTags();
  return tags.map((tag) => ({
    tag,
  }));
}

export default async function BlogIndex({ params: { tag } }: Props) {
  const tagName = decodeURIComponent(tag);
  const { entries, pager } = await getBlogEntries({ tag: [tagName] });

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
        <div className="flex flex-col gap-12">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="m-1 inline-flex flex-1">
                <span>
                  <span className="text-sm">タグ:</span>
                </span>
                <span className="inline-flex flex-1 flex-wrap items-center gap-2 px-3 py-0.5 text-sm">
                  <span>
                    <Badge>{tagName}</Badge>
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
            <Suspense>
              <div className="flex justify-center">
                <Pagination
                  currentPage={1}
                  previous={pager?.previous}
                  pages={pager?.pages}
                  next={pager.next}
                />
              </div>
            </Suspense>
          )}
        </div>
      </main>
    </Container>
  );
}
