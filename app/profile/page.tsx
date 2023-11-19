import { notFound } from 'next/navigation';
import { getProfileEntry } from './api';
import { UnitIndex, SmartPhotoJs, Container } from '../components';
import { Metadata } from 'next';
import { getOGP } from '../api';

export async function generateMetadata(): Promise<Metadata> {
  const { openGraph, ...rest } = await getOGP('/profile');
  return {
    ...rest,
    openGraph: {
      ...openGraph,
      type: 'profile',
    },
  };
}

export default async function About() {
  const entry = await getProfileEntry();

  if (entry === null) {
    notFound();
  }

  return (
    <Container>
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
    </Container>
  );
}
