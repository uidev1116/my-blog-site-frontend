import { UnitIndex, Container } from '@/app/components';
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
              <h1 className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white lg:text-4xl">
                {entry.title}
              </h1>
            </header>
            {entry.units !== undefined && (
              <div className="format format-sm dark:format-invert sm:format-base lg:format-lg">
                <UnitIndex units={entry.units} />
              </div>
            )}
          </article>
        </div>
      </main>
    </Container>
  );
}
