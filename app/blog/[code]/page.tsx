import { notFound } from 'next/navigation';
import { formatISO9075, format } from 'date-fns';
import {
  getAllBlogEntries,
  getTagRelationalEntries,
  getBlogEntry,
} from '../api';
import {
  UnitIndex,
  Container,
  EntryList,
  TagList,
  ShareSocialMedia,
} from '@/app/components';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { acmsPath } from '@/app/lib';
import { BASE_URL } from '@/app/config';

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const { openGraph, twitter, ...rest } = await getMetadata({
    blog: 'blog',
    entry: params.code,
  });
  // OGP画像は動的生成した画像を利用する
  delete openGraph?.images;
  delete twitter?.images;
  return {
    ...rest,
    openGraph,
    twitter,
    alternates: {
      canonical: acmsPath({ blog: 'blog', entry: params.code }),
    },
  };
}

export async function generateStaticParams() {
  const entries = await getAllBlogEntries();

  console.log(
    entries.map((entry) => ({
      code: entry.code,
    })),
  );

  return entries.map((entry) => ({
    code: entry.code,
  }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const entry = await getBlogEntry(code);

  if (entry === null) {
    notFound();
  }

  const relationalEntries = await getTagRelationalEntries(code);

  return (
    <>
      <Container>
        <main className="bg-white dark:bg-gray-900">
          <div className="mx-auto flex max-w-screen-xl justify-between px-4">
            <article className="mx-auto w-full max-w-2xl space-y-4 break-words lg:space-y-6">
              <header className="space-y-4 lg:space-y-6">
                <div>
                  <h1 className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white lg:text-4xl">
                    {entry.title}
                  </h1>
                </div>
                <div className="text-right text-sm">
                  公開日:{' '}
                  <time dateTime={formatISO9075(entry.createdAt)}>
                    {format(entry.createdAt, 'yyyy/MM/dd')}
                  </time>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div>
                    <TagList tags={entry.tags} isLink />
                  </div>
                )}
                <div>
                  <div className="border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-700">
                    <h2 className="mb-3 font-bold dark:text-white">目次</h2>
                    <nav
                      className="js-outline-yield break-words"
                      aria-label="目次"
                    />
                  </div>
                </div>
              </header>
              {entry.units !== undefined && (
                <div className="format format-sm dark:format-invert sm:format-base lg:format-lg">
                  <div className="js-outline" data-target=".js-outline-yield">
                    <UnitIndex units={entry.units} />
                  </div>
                </div>
              )}
              <footer>
                <ShareSocialMedia
                  title={entry.title}
                  url={new URL(entry.path, BASE_URL).toString()}
                />
              </footer>
            </article>
          </div>
        </main>
      </Container>
      <aside
        aria-label="関連記事"
        className="bg-gray-50 py-8 dark:bg-gray-800 lg:py-24"
      >
        <div className="mx-auto max-w-screen-xl px-4">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
            関連記事
          </h2>
          {relationalEntries.length > 0 ? (
            <EntryList
              className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
              entries={relationalEntries}
            />
          ) : (
            <p>関連記事が存在しません</p>
          )}
        </div>
      </aside>
    </>
  );
}
