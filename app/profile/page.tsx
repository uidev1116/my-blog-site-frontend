import { notFound } from 'next/navigation';
import { getProfileEntry } from './api';
import { UnitIndex, SmartPhotoJs } from '../components';

export default async function About() {
  const entry = await getProfileEntry();

  if (entry === null) {
    notFound();
  }

  return (
    <div className="px-4 py-8 lg:container lg:mx-auto lg:py-12">
      <main className="bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-screen-xl justify-between px-4">
          <article className="format format-sm format-blue mx-auto w-full max-w-2xl dark:format-invert sm:format-base lg:format-lg">
            <header className="not-format mb-4 lg:mb-6">
              <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white lg:mb-6 lg:text-4xl">
                {entry.title}
              </h1>
            </header>
            {entry.units !== undefined && <UnitIndex units={entry.units} />}
            <SmartPhotoJs />
          </article>
        </div>
      </main>
    </div>
  );
}
