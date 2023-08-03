import Link from 'next/link';
import { Card } from './components';
import { range } from './utils';

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-12">
        <div>
          <ul className="grid gap-4 md:grid-cols-2">
            {range(1, 10).map((index) => (
              <li key={index}>
                <Link href="#">
                  <Card
                    title="Noteworthy technology acquisitions 2021"
                    description="Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <Link
            href="#"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-darker focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-primary dark:hover:bg-primary dark:focus:ring-primary-darker"
          >
            ブログ一覧
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
    </main>
  );
}
