import { Container, EmptyState, EntryList, Pagination } from '@/app/components';
import { getBlogEntries } from '../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { objToSearchParams } from '@/app/utils';
import { acmsPath } from '@/app/lib/acmsPath';
import { Suspense } from 'react';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    searchParams: objToSearchParams(searchParams),
  });
}

export default async function BlogSearchPage({ searchParams }: Props) {
  const { entries, pager } = await getBlogEntries({
    searchParams: objToSearchParams(searchParams),
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
      </main>
    </Container>
  );
}
