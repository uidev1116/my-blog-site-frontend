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
                className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                {`${indexBlogName}一覧`}
                <svg
                  className="ms-2 h-3.5 w-3.5 rtl:rotate-180"
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
