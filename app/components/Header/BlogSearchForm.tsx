'use client';

import type { Entry } from '@/app/types';
import type { UseComboboxActions, UseComboboxStateChange } from 'downshift';
import { ComponentProps, Suspense, useState } from 'react';
import { encodeUri } from '@/app/utils';
import { clsx } from 'clsx';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ComboBox = dynamic(
  () => import('@/app/components/ComboBox').then((mod) => mod.ComboBox<Entry>),
  { ssr: false },
);

async function getEntries(keyword: string) {
  const res = await fetch(`/api/blog/?keyword=${encodeUri(keyword)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const { entries } = await res.json();
  return entries as Entry[];
}

export default function BlogSearchForm() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    router.push(
      `/blog/search/?keyword=${encodeUri(formData.get('search') as string)}`,
    );
  }

  async function handleInputValueChange({
    inputValue,
  }: UseComboboxStateChange<Entry>) {
    if (inputValue === undefined || inputValue === '') {
      return setEntries([]);
    }
    try {
      const entries = await getEntries(inputValue);
      setEntries(entries);
    } catch (error) {
      console.error(error);
      setEntries([]);
    }
  }

  function itemToString(item: Entry | null) {
    return item ? item.title : '';
  }

  function renderInput(
    inputProps: Parameters<ComponentProps<typeof ComboBox>['renderInput']>[0],
  ) {
    return (
      <div>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-4 w-4 text-gray-500 dark:text-gray-400"
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
          <span className="sr-only">検索アイコン</span>
        </div>
        <input
          type="text"
          name="search"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary dark:focus:ring-primary"
          placeholder="検索..."
          {...inputProps}
        />
      </div>
    );
  }

  function renderMenu(
    isOpen: Parameters<ComponentProps<typeof ComboBox>['renderMenu']>[0],
    items: Parameters<ComponentProps<typeof ComboBox>['renderMenu']>[1],
    menuProps: Parameters<ComponentProps<typeof ComboBox>['renderMenu']>[2],
    options: Parameters<ComponentProps<typeof ComboBox>['renderMenu']>[3],
  ) {
    return (
      <div>
        <ul
          className={clsx(
            'absolute z-10 mt-1 max-h-80 w-full overflow-scroll bg-white p-0 shadow-md',
            {
              hidden: !(isOpen && items.length),
            },
          )}
          {...menuProps}
        >
          {options}
        </ul>
      </div>
    );
  }

  function renderOption(
    optionProps: Parameters<ComponentProps<typeof ComboBox>['renderOption']>[0],
    entry: Parameters<ComponentProps<typeof ComboBox>['renderOption']>[1],
    isHighlighted: Parameters<
      ComponentProps<typeof ComboBox>['renderOption']
    >[2],
    isSelected: Parameters<ComponentProps<typeof ComboBox>['renderOption']>[3],
  ) {
    return (
      <li
        className={clsx(
          isHighlighted && 'bg-primary text-white',
          isSelected && 'font-bold',
          'flex flex-col px-3 py-2 shadow-sm',
        )}
        {...optionProps}
      >
        <span>{entry.title}</span>
      </li>
    );
  }

  function handleSelectedItemChange({
    selectedItem,
  }: UseComboboxStateChange<Entry>) {
    if (selectedItem === null || selectedItem === undefined) {
      return;
    }

    router.push(selectedItem.path);
  }

  function handlePageChange(
    _: string,
    searchParams: ReadonlyURLSearchParams,
    { reset, setInputValue }: UseComboboxActions<Entry>,
  ) {
    const keyword = searchParams.get('keyword');
    if (keyword === null) {
      return reset();
    }
    setInputValue(keyword);
  }

  return (
    <form action="" role="search" onSubmit={handleSubmit}>
      <ComboBox
        id="search-navbar"
        items={entries}
        onInputValueChange={handleInputValueChange}
        onSelectedItemChange={handleSelectedItemChange}
        itemToString={itemToString}
        renderInput={renderInput}
        renderMenu={renderMenu}
        renderOption={renderOption}
        onPageChange={handlePageChange}
      />
    </form>
  );
}
