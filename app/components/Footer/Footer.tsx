import Link from 'next/link';
import { getFooterNavigation } from '@/app/api';

export default async function Footer() {
  const data = await getFooterNavigation();
  return (
    <footer className="m-4 rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="mx-auto w-full max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
          © 2023{' '}
          <a href="/" className="hover:underline">
            uidev.jp
          </a>
          . All Rights Reserved.
        </span>
        {data.length > 0 && (
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0 md:gap-x-6">
            {data.map((navigation) => (
              <li key={navigation.url}>
                <Link
                  href={navigation.url}
                  className="hover:underline"
                  target={navigation.target}
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
