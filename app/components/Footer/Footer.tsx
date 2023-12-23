import Link from 'next/link';
import type { FooterNavigation } from '@/app/api';

type Props = {
  navigations: FooterNavigation[];
};

export default async function Footer({ navigations }: Props) {
  return (
    <footer className="m-4 rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="mx-auto w-full max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
          © 2023{' '}
          <a href="/" className="hover:underline">
            blog.uidev.jp
          </a>
          . All Rights Reserved.
        </span>
        {navigations.length > 0 && (
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0 md:gap-x-6">
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
