import Link from 'next/link';
import { EmptyState, Container, EntryList } from '@/app/components';
import { getBlogEntries, getMetadata } from '@/app/api';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata();
}

export default async function HomePage() {
  const { indexPath, indexBlogName, entries } = await getBlogEntries();

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
          <div>
            <div className="flex justify-end">
              <Link
                href={indexPath}
                className="inline-flex items-center rounded-lg bg-stone-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-stone-900 focus:outline-none focus:ring-4 focus:ring-stone-300 dark:bg-stone-900 dark:hover:bg-stone-700 dark:focus:ring-stone-900"
              >
                {`${indexBlogName}一覧`}
                <svg
                  className="ml-2 h-3.5 w-3.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}
