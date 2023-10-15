import Link from 'next/link';
import { Card, Pagination } from '@/app/components';
import { getBlogEntries } from '../../api';
import { getAllBlogTags } from '../api';

export async function generateStaticParams() {
  const tags = await getAllBlogTags();
  console.log(tags);
  const r = tags.map((tag) => ({ tag }));
  console.log('r', r);
  return r;
}

export default async function BlogIndex({
  params,
}: {
  params: { tag: string[] };
}) {
  const { tag } = params;
  const { entries, pager } = await getBlogEntries({ tag });
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
