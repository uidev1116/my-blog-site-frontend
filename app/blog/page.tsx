import Link from 'next/link';
import { Card, Container, EmptyState, Pagination } from '@/app/components';
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
