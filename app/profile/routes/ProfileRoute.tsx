import { EntryBody, Container } from '@/app/components';
import { Entry } from '@/app/types';

type Props = {
  entry: Entry;
};

export default function ProfileRoute({ entry }: Props) {
  return (
    <Container>
      <main className="bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-screen-xl justify-between px-4">
          <article className="mx-auto w-full max-w-2xl space-y-4 break-words lg:space-y-6">
            <header className="space-y-4 lg:space-y-6">
              <h1 className="text-3xl leading-tight font-extrabold text-gray-900 lg:text-4xl dark:text-white">
                {entry.title}
              </h1>
            </header>
            {entry.body && (
              <div className="format format-sm dark:format-invert sm:format-base lg:format-lg">
                <EntryBody html={entry.body} />
              </div>
            )}
          </article>
        </div>
      </main>
    </Container>
  );
}
