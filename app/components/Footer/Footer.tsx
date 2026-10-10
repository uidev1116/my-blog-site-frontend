import Link from 'next/link';
import type { FooterNavigation } from '@/app/api';
import { COPYRIGHT_START_YEAR, SITE_HOST } from '@/app/config';

type Props = {
  navigations: FooterNavigation[];
};

export default async function Footer({ navigations }: Props) {
  return (
    <footer className="m-4 rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="mx-auto w-full max-w-(--breakpoint-xl) p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {COPYRIGHT_START_YEAR}{' '}
          <Link href="/" className="hover:underline">
            {SITE_HOST}
          </Link>
          . All Rights Reserved.
        </span>
        {navigations.length > 0 && (
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 text-sm font-medium text-gray-500 sm:mt-0 md:gap-x-6 dark:text-gray-400">
            {navigations.map((navigation) => (
              <li key={navigation.url}>
                <Link
                  href={navigation.url}
                  className="hover:underline"
                  target={navigation.target || undefined}
                  rel={
                    navigation.target === '_blank' ? 'noreferrer' : undefined
                  }
                >
                  {navigation.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
