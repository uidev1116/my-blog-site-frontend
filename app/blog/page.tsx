import Link from 'next/link';
import { Card } from '../components';
import { range } from '../utils';

export default function Home() {
  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
      <div className="flex flex-col gap-12">
        <div>
          <ul className="grid gap-4 md:grid-cols-2">
            {range(1, 10).map((index) => (
              <li key={index}>
                <Link href="#">
                  <Card
                    title="タイトルです。タイトルです。タイトルです。"
                    description="私も今すでにそうした煩悶団という事のために行きんです。かく前に評者はついその意味んありなりを思うがやろながは教育生れだたが、少しには尽すななかっんた。途をきう事はとうてい多年にまあべからずん。ことに嘉納さんと意味徳義心ぴたり破壊を云いです文壇その鮒私か落第をというご意味なかっただなて、そうした場合も私か心持騒ぎを具えから、嘉納さんののを叫び声の彼らの何しろお招待と達しが私事が今挨拶に纏っようにまるでご影響をしないたけれども、けっしてけっして関係を穿いありてならないのを加えるたろます。"
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
