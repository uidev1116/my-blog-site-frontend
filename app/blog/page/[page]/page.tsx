import Link from 'next/link';
import { Card, Pagination } from '@/app/components';
import { range } from '@/app/utils';
import { getBlogEntries } from '../../api';

export async function generateStaticParams() {
  const { pager } = await getBlogEntries();
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndex({
  params,
}: {
  params: { page: string };
}) {
  const { page } = params;
  const { entries, pager } = await getBlogEntries({ page: parseInt(page, 10) });
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
          {pager !== undefined && (
            <div className="flex justify-center">
              <Pagination
                currentPage={parseInt(page, 10)}
                previous={pager?.previous}
                pages={pager?.pages}
                next={pager?.next}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
