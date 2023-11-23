import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatISO9075, format } from 'date-fns';
import { getBlogEntries, getTagRelationalEntries, getBlogEntry } from '../api';
import {
  UnitIndex,
  Badge,
  SmartPhotoJs,
  DocumentOutlierJs,
  Container,
  EntryList,
} from '@/app/components';
import { Metadata } from 'next';
import { getOGP } from '@/app/api';

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  return await getOGP(`/blog/${params.code}`);
}

export async function generateStaticParams() {
  const { entries } = await getBlogEntries();

  return entries.map((entry) => ({
    code: entry.code,
  }));
}

export default async function BlogDetail({
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
                    <ul className="inline-flex flex-wrap gap-x-2">
                      {entry.tags.map((tag) => (
                        <li key={tag.name}>
                          <Link href={tag.path}>
                            <Badge>{tag.name}</Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
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
                  <div className="js-outline">
                    <UnitIndex units={entry.units} />
                  </div>
                  <DocumentOutlierJs
                    options={{
                      listClassName:
                        'pl-4 [&.level-1]:relative [&.level-1]:border-l [&.level-1]:border-gray-200 [&.level-1]:dark:border-gray-700 ',
                      itemClassName:
                        "before:content[''] before:absolute before:w-2.5 before:h-2.5 before:bg-gray-200 before:rounded-full before:mt-3 before:-left-1.5 before:border-2 before:border-white before:dark:border-gray-900 before:dark:bg-gray-700 [.level-1>&]:before:w-3 [.level-1>&]:before:h-3 [.level-1>&]:before:border",
                      linkClassName:
                        'block text-gray-900 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:focus:ring-gray-700 bg-white text-sm/base my-2 font-medium hover:text-primary-darkest focus:z-10 focus:text-primary-darkest focus:outline-none',
                    }}
                  />
                </div>
              )}
              <SmartPhotoJs />
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
