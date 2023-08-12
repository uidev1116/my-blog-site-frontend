import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-stone-700 dark:text-white lg:text-9xl">
            404
          </h1>
          <p className="mb-4 text-lg font-light text-stone-500 dark:text-stone-400">
            申し訳ございませんが、お探しのページは存在していないようです。
          </p>
          <Link
            href="/"
            className="my-4 inline-flex rounded-lg bg-stone-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-stone-900 focus:outline-none focus:ring-4 focus:ring-stone-900 dark:focus:ring-stone-900"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </section>
  );
}
