import { Collapse, ThemeColorSwitcher } from '@/app/components';
import NavLink from './NavLink';

import type { GlobalNavigation } from '@/app/api';
import { BlogSearchForm } from '@/app/components';
import Logo from './Logo';

type Props = {
  navigations: GlobalNavigation[];
};

export default async function Header({ navigations }: Props) {
  return (
    <header className="sticky top-0 z-10">
      <nav className="top-0 left-0 border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">
        <div className="mx-auto flex max-w-(--breakpoint-xl) flex-wrap items-center justify-between p-4">
          <Logo />
          <div className="flex md:order-2">
            <div className="block md:hidden">
              <ThemeColorSwitcher />
            </div>
            <div>
              <Collapse
                toggle="navbar-search"
                className="mr-1 rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </Collapse>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-x-2">
                <div>
                  <ThemeColorSwitcher />
                </div>
                <div className="w-72">
                  <BlogSearchForm id="blog-search-form" />
                </div>
              </div>
            </div>
            <div>
              <Collapse
                toggle="navbar-search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:outline-none md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </Collapse>
            </div>
          </div>
          <div
            className="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto"
            id="navbar-search"
          >
            <div className="mt-3 space-y-4 md:mt-0 md:space-y-0">
              <div className="md:hidden">
                <BlogSearchForm id="mobile-blog-search-form" />
              </div>
              <div>
                {navigations.length > 0 && (
                  <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 dark:border-gray-700 dark:bg-gray-800 md:dark:bg-gray-900">
                    {navigations.map((navigation) => (
                      <li key={navigation.url}>
                        <NavLink
                          href={navigation.url}
                          target={navigation.target || undefined}
                          rel={
                            navigation.target === '_blank'
                              ? 'noreferrer'
                              : undefined
                          }
                        >
                          {navigation.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
