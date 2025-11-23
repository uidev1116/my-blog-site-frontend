'use client';

import { useBrowser } from '@/app/hooks';
import { isDarkMode, useColorThemeStore } from '@/app/stores/color-theme';
import clsx from 'clsx';
import { initDropdowns } from 'flowbite';
import React, { useEffect, useId, useMemo } from 'react';

const colorThemes = [
  {
    name: 'light',
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        />
      </svg>
    ),
  },
  {
    name: 'dark',
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"
        />
      </svg>
    ),
  },
  {
    name: 'system',
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 15v5m-3 0h6M4 11h16M5 15h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1Z"
        />
      </svg>
    ),
  },
];

function ThemeColorSwitcher() {
  const id = useId();
  const isBrowser = useBrowser();

  useEffect(() => {
    if (isBrowser) {
      initDropdowns();
    }
  }, [isBrowser]);

  const { colorTheme, changeColorTheme, removeColorTheme } =
    useColorThemeStore();

  const colorThemeName = useMemo(() => colorTheme ?? 'system', [colorTheme]);

  function handleClick(colorTheme: 'light' | 'dark' | 'system') {
    if (colorTheme === 'system') {
      removeColorTheme();
    } else {
      changeColorTheme(colorTheme);
    }
    // @ts-expect-error: FlowbiteInstances is not defined in global scope
    const dropdown = FlowbiteInstances.getInstance(
      'Dropdown',
      `dropdown-${id}`,
    );
    dropdown.hide();
  }

  function renderIcon(colorTheme?: 'light' | 'dark') {
    if (isBrowser && isDarkMode(colorTheme)) {
      return colorThemes.find((theme) => theme.name === 'dark')?.icon;
    }

    return colorThemes.find((theme) => theme.name === 'light')?.icon;
  }

  if (!isBrowser) {
    return null;
  }

  return (
    <>
      <button
        id={id}
        data-dropdown-toggle={`dropdown-${id}`}
        className={clsx(
          'inline-flex h-10 w-10 items-center justify-center rounded-lg p-2.5 text-sm hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:hover:bg-gray-700 dark:focus:ring-gray-700',
          {
            'text-primary': isBrowser && colorTheme !== undefined,
            'text-gray-800 dark:text-white':
              isBrowser && colorTheme === undefined,
          },
        )}
        type="button"
      >
        {renderIcon(colorTheme)}
      </button>
      <div
        id={`dropdown-${id}`}
        className="z-10 hidden w-36 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="themeColorSwitcher"
        >
          {colorThemes.map((theme) => (
            <li
              key={theme.name}
              className={clsx('group', {
                'is-selected': theme.name === colorThemeName,
              })}
            >
              <button
                type="button"
                className="block w-full px-4 py-2 text-gray-800 group-[.is-selected]:text-primary hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                onClick={() =>
                  handleClick(theme.name as 'light' | 'dark' | 'system')
                }
              >
                <span className="flex items-center gap-x-2">
                  <span>{theme.icon}</span>
                  <span className="font-bold capitalize">{theme.name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default ThemeColorSwitcher;
