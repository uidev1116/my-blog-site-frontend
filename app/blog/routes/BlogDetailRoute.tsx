import { formatISO9075, format } from 'date-fns';
import {
  EntryBody,
  Container,
  EntryList,
  TagList,
  ShareSocialMedia,
} from '@/app/components';
import { BASE_URL } from '@/app/config';
import { Entry } from '@/app/types';

type Props = {
  entry: Entry;
  relationalEntries: Entry[];
};

export default function BlogDetailRoute({ entry, relationalEntries }: Props) {
  return (
    <>
      <Container>
        <main className="bg-white dark:bg-gray-900">
          <div className="mx-auto flex max-w-(--breakpoint-xl) justify-between px-4">
            <article className="mx-auto w-full max-w-2xl space-y-4 wrap-break-word lg:space-y-6">
              <header className="space-y-4 lg:space-y-6">
                <div>
                  <h1 className="text-3xl leading-tight font-extrabold text-gray-900 lg:text-4xl dark:text-white">
                    {entry.title}
                  </h1>
                </div>
                <div className="text-right text-sm text-black dark:text-white">
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
                  <div className="border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-900">
                    <h2 className="mb-3 font-bold dark:text-white">目次</h2>
                    <nav
                      className="js-outline-yield wrap-break-word"
                      aria-label="目次"
                    />
                  </div>
                </div>
              </header>
              {entry.body && (
                <div className="format format-sm dark:format-invert sm:format-base lg:format-lg">
                  <div className="js-outline" data-target=".js-outline-yield">
                    <EntryBody html={entry.body} />
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
        className="bg-gray-50 py-8 lg:py-24 dark:bg-gray-800"
      >
        <div className="mx-auto max-w-(--breakpoint-xl) px-4">
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
