import Link from 'next/link';
import { Card, Pagination, Badge } from '@/app/components';
import { getBlogEntries, getTagFilter } from '../../api';
import { getAllBlogTags } from '../api';

export async function generateStaticParams() {
  const tags = await getAllBlogTags();
  return tags.map((tag) => ({
    tag,
  }));
}

export default async function BlogIndex({
  params: { tag },
}: {
  params: { tag: string };
}) {
  const tagName = decodeURIComponent(tag);
  const { entries, pager } = await getBlogEntries({ tag: [tagName] });

  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
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
                <span className="text-sm text-gray-700 hover:text-primary dark:text-gray-400">
                  <Link href="/blog/">全て表示する</Link>
                </span>
              </div>
            </div>
          </div>
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
