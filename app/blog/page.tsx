import Link from 'next/link';
import { Card, Pagination } from '@/app/components';
import { getBlogEntries } from './api';

export default async function BlogIndex() {
  const { entries, pager } = await getBlogEntries();
  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
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
    </div>
  );
}
