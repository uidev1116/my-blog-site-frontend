import { Container, EmptyState, EntryList, Pagination } from '@/app/components';
import { getBlogEntries } from './api';
import { Metadata } from 'next';
import { getOGP } from '../api';

export async function generateMetadata(): Promise<Metadata> {
  const { openGraph, ...rest } = await getOGP('/blog');
  return {
    ...rest,
    openGraph: {
      ...openGraph,
      type: 'website',
    },
  };
}

export default async function BlogIndex() {
  const { entries, pager } = await getBlogEntries();

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
      </main>
    </Container>
  );
}
