'use client';
import Link from 'next/link';
import { useUrlMatch } from '@/app/hooks';

import type { HTMLAttributeAnchorTarget } from 'react';
import type { UrlMatchType } from '@/app/hooks';

type Props = {
  href: string;
  target: HTMLAttributeAnchorTarget;
  matchType: UrlMatchType;
  children?: React.ReactNode;
};

export default function NavLink({ href, target, matchType, children }: Props) {
  const url = new URL(href, process.env.NEXT_PUBLIC_BASE_URL);
  const isMatch = useUrlMatch(url, matchType);
  const isFullMatch = useUrlMatch(url, 'full');

  return (
    <Link
      href={href}
      className={`block rounded py-2 pl-3 pr-4 md:p-0 ${
        isMatch
          ? 'bg-primary text-white md:bg-transparent md:text-primary md:dark:text-primary'
          : 'text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:hover:text-primary-darker md:dark:hover:bg-transparent md:dark:hover:text-primary-darker'
      }`}
      target={target}
      aria-current={isFullMatch ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
