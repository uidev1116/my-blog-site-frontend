'use client';

import Link from 'next/link';
import { useUrlMatch } from '@/app/hooks';

import { BASE_URL } from '@/app/config';
import clsx from 'clsx';
import { useMemo } from 'react';

type Props = {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  children?: React.ReactNode;
};

export default function NavLink({ href, target, rel, children }: Props) {
  const url = new URL(href, BASE_URL);
  const { isMatchFull, isMatchStart } = useUrlMatch(url);

  const baseStyles = 'block rounded py-2 pl-3 pr-4 md:p-0';
  const activeStyles =
    'bg-primary text-white md:bg-transparent md:text-primary md:dark:text-primary';
  const inactiveStyles =
    'text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:hover:text-primary-darker md:dark:hover:bg-transparent md:dark:hover:text-primary-darker';

  const isMatch = useMemo(
    () => (href === '/' ? isMatchFull : isMatchStart),
    [href, isMatchFull, isMatchStart],
  );

  return (
    <Link
      href={href}
      className={clsx(baseStyles, {
        [activeStyles]: isMatch === true,
        [inactiveStyles]: isMatch === false,
      })}
      target={target}
      rel={rel}
      aria-current={isMatchFull ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
