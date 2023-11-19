import Link from 'next/link';
import { Card, Container, EmptyState, Pagination } from '@/app/components';
import { getBlogEntries } from '../api';
import { Metadata } from 'next';
import { getOGP } from '@/app/api';
import { parseNextSearchPrams } from '@/app/utils/next';
import { acmsPath } from '@/app/lib';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { openGraph, ...rest } = await getOGP(
    '/blog',
    parseNextSearchPrams(searchParams),
  );
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

export default async function BlogSearchPage({ searchParams }: Props) {
  const { entries, pager } = await getBlogEntries({
    searchParams: parseNextSearchPrams(searchParams),
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

  const paginationProps = {
    currentPage: 1,
    previous: pager?.previous && {
      ...pager.previous,
      path: `/blog/search${acmsPath({ page: pager.previous.page })}`,
    },
    pages:
      pager?.pages.map((page) => ({
        ...page,
        path: `/blog/search${acmsPath({ page: page.page })}`,
      })) || [],
    next: pager?.next && {
      ...pager.next,
      path: `/blog/search${acmsPath({ page: pager.next.page })}`,
    },
  };

  return (
    <Container>
      <main>
        <div className="flex flex-col gap-12">
          <div>
            <ul className="grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <Link href={entry.path} className="flex h-full">
                    <Card
                      title={entry.title}
                      description={entry.summary}
                      datetime={entry.createdAt}
                      tags={entry.tags}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {pager !== undefined && pager.pages.length > 0 && (
            <div className="flex justify-center">
              <Pagination {...paginationProps} />
            </div>
          )}
        </div>
      </main>
    </Container>
  );
}
