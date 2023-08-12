import Link from 'next/link';
import { Card } from '../components';

const entries = [
  {
    id: 1,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2022-08-12 00:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'りんご',
        url: '/',
      },
      {
        name: 'なし',
        url: '/',
      },
      {
        name: 'ぶどう',
        url: '/',
      },
    ],
  },
  {
    id: 2,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2022-06-05 00:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'ぶどう',
        url: '/',
      },
    ],
  },
  {
    id: 3,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2022-03-14 17:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'りんご',
        url: '/',
      },
      {
        name: 'なし',
        url: '/',
      },
      {
        name: 'ぶどう',
        url: '/',
      },
    ],
  },
  {
    id: 4,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2022-03-01 22:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [],
  },
  {
    id: 5,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2021-12-31 00:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'もも',
        url: '/',
      },
      {
        name: 'ぶどう',
        url: '/',
      },
    ],
  },
  {
    id: 6,
    title:
      'タイトルです。タイトルです。タイトルです。タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2021-11-30 17:30:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'りんご',
        url: '/',
      },
      {
        name: 'なし',
        url: '/',
      },
      {
        name: 'ぶどう',
        url: '/',
      },
      {
        name: 'もも',
        url: '/',
      },
      {
        name: 'みかん',
        url: '/',
      },
      {
        name: 'パイナップル',
        url: '/',
      },
    ],
  },
  {
    id: 7,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2021-08-15 00:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'りんご',
        url: '/',
      },
    ],
  },
  {
    id: 8,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2021-07-10 22:45:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'なし',
        url: '/',
      },
    ],
  },
  {
    id: 9,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2020-03-31 00:00:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [
      {
        name: 'ぶどう',
        url: '/',
      },
    ],
  },
  {
    id: 10,
    title: 'タイトルです。タイトルです。タイトルです。',
    datetime: new Date('2018-04-01 10:22:00'),
    summary:
      'どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけ...',
    tag: [],
  },
];

export default function Home() {
  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
      <div className="flex flex-col gap-12">
        <div>
          <ul className="grid gap-4 md:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link href="/" className="flex h-full">
                  <Card
                    title={entry.title}
                    description={entry.summary}
                    datetime={entry.datetime}
                    tags={entry.tag}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <nav aria-label="Page navigation example">
            <ul className="flex h-10 items-center -space-x-px text-base">
              <li>
                <a
                  href="/"
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
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  1
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  2
                </a>
              </li>
              <li>
                <a
                  href="/"
                  aria-current="page"
                  className="z-10 flex h-10 items-center justify-center border border-gray-300 bg-primary-lightest px-4 leading-tight text-primary hover:bg-primary-lighter hover:text-primary-darker dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                >
                  3
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  4
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="flex h-10 items-center justify-center border border-gray-300 bg-white px-4 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  5
                </a>
              </li>
              <li>
                <a
                  href="/"
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
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
