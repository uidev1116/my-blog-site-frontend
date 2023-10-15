'use client';

import Link from 'next/link';

type Props = {
  currentPage: number;
  previous?: {
    path: string;
    num: number;
    page: number;
  };
  pages: {
    page: number;
    path: string;
  }[];
  next?: {
    path: string;
    num: number;
    page: number;
  };
};

export default function Pagination({
  currentPage,
  pages,
  previous,
  next,
}: Props) {
  return (
    <nav aria-label="Page navigation">
      <ul className="flex h-10 items-center -space-x-px text-base">
        {previous && (
          <li>
            <Link
              href={previous.path}
              className="ml-0 flex h-10 items-center justify-center rounded-l-lg border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </Link>
          </li>
        )}
        {pages.length > 0 &&
          pages.map(({ page, path }) => (
            <li key={page}>
              {page === currentPage ? (
                <span className="flex h-10 items-center justify-center border border-gray-300 bg-primary-lightest px-4 leading-tight text-primary hover:bg-primary-lighter hover:text-primary-darker dark:border-gray-700 dark:bg-gray-700 dark:text-white">
                  {page}
                </span>
              ) : (
                <Link
                  href={path}
                  className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {page}
                </Link>
              )}
            </li>
          ))}
        {next && (
          <li>
            <a
              href={next.path}
              className="flex h-10 items-center justify-center rounded-r-lg border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
