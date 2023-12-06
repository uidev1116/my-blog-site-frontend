import { notFound } from 'next/navigation';
import { formatISO9075, format } from 'date-fns';
import { getBlogEntries, getTagRelationalEntries, getBlogEntry } from '../api';
import { UnitIndex, Container, EntryList, TagList } from '@/app/components';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { acmsPath } from '@/app/lib';

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
  const { entries } = await getBlogEntries();

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
            <article className="format format-sm mx-auto w-full max-w-2xl break-words dark:format-invert sm:format-base lg:format-lg">
              <header className="not-format mb-4 lg:mb-6">
                <div className="mb-4 lg:mb-6">
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
              </header>
              {entry.units !== undefined && (
                <div>
                  <div className="not-format mb-4 lg:mb-6">
                    <div className="border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-700">
                      <h2 className="mb-3 text-xl font-bold dark:text-white">
                        目次
                      </h2>
                      <nav
                        className="js-outline-yield break-words"
                        aria-label="目次"
                      />
                    </div>
                  </div>
                  <div className="js-outline" data-target=".js-outline-yield">
                    <UnitIndex units={entry.units} />
                  </div>
                </div>
              )}
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
