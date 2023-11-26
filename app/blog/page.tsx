import { Container, EmptyState, EntryList, Pagination } from '@/app/components';
import { getBlogEntries } from './api';
import { Metadata } from 'next';
import { getOGP } from '../api';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return await getOGP({ blog: 'blog' });
}

export default async function BlogIndexPage() {
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
