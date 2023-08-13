import Link from 'next/link';
import { Card, Pagination } from '../components';

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

export default function Blog() {
  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
      <main>
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
            <Pagination
              previous={{ url: '/blog/', num: 10, page: 2 }}
              pages={[
                {
                  page: 1,
                  url: '/blog/',
                },
                {
                  page: 2,
                  url: '/blog/',
                },
                {
                  page: 3,
                },
                {
                  page: 4,
                  url: '/blog/',
                },
                {
                  page: 5,
                  url: '/blog/',
                },
              ]}
              next={{ url: '/blog/', num: 10, page: 4 }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
