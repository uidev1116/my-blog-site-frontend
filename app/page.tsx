import Link from 'next/link';
import { Card } from './components';

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
                <Link href="#" className="flex h-full">
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
    </div>
  );
}
