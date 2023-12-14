'use client';

import type { Entry } from '@/app/types';
import {
  UseComboboxActions,
  UseComboboxStateChange,
  useCombobox,
} from 'downshift';
import { ComponentProps, useRef } from 'react';
import { encodeUri } from '@/app/utils';
import { clsx } from 'clsx';
import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import useBlogEntriesSwrMutation from '@/app/hooks/useBlogEntriesSwrMutation/useBlogEntriesSwrMutation';
import { Spinner } from '@/app/components/Spinner';

type Props = {
  id: string;
};

const ComboBox = dynamic(
  () => import('@/app/components/ComboBox').then((mod) => mod.ComboBox<Entry>),
  { ssr: false },
);

export default function BlogSearchForm({ id }: Props) {
  const router = useRouter();
  const { entries, error, trigger, reset, isMutating } =
    useBlogEntriesSwrMutation();

  const formRef = useRef<HTMLFormElement>(null);

  function navigateToSearchPage() {
    if (formRef.current === null) {
      return;
    }
    const formData = new FormData(formRef.current);
    const keyword = formData.get('keyword');

    if (keyword === null || keyword === '') {
      return;
    }
    router.push(`/blog/search/?keyword=${encodeUri(keyword as string)}`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToSearchPage();
  }

  async function handleInputValueChange({
    inputValue,
  }: UseComboboxStateChange<Entry>) {
    if (inputValue === undefined || inputValue === '') {
      return reset();
    }
    await trigger({ keyword: inputValue });
  }

  function itemToString(item: Entry | null) {
    return item ? item.title : '';
  }

  function renderInput(
    ...args: Parameters<ComponentProps<typeof ComboBox>['renderInput']>
  ) {
    const [getInputProps] = args;
    // aria-labelledby属性は不要なので削除する
    const { 'aria-labelledby': _, ...inputProps } = getInputProps();

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
          name="keyword"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-8 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary dark:focus:ring-primary"
          placeholder="検索..."
          {...inputProps}
        />
        {isMutating && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Spinner />
          </div>
        )}
      </div>
    );
  }

  function renderMenu(
    ...args: Parameters<ComponentProps<typeof ComboBox>['renderMenu']>
  ) {
    const [isOpen, items, inputValue, getMenuProps, menuItems] = args;
    return (
      <div>
        <ul
          className={clsx(
            'absolute z-10 mt-1 max-h-80 w-full overflow-scroll bg-white p-0 shadow-md',
            {
              hidden: !isOpen,
            },
          )}
          {...getMenuProps()}
        >
          {error ? (
            <li className="flex flex-col px-3 py-2 shadow-sm">
              <span className="font-sm">記事の検索に失敗しました。</span>
            </li>
          ) : (
            menuItems
          )}
        </ul>
      </div>
    );
  }

  function renderMenuItem(
    ...args: Parameters<ComponentProps<typeof ComboBox>['renderMenuItem']>
  ) {
    const [getItemProps, item, index, highlightedIndex, selectedItem] = args;
    return (
      <li
        className={clsx(
          highlightedIndex === index && 'bg-gray-100',
          selectedItem === item && 'font-bold',
          'flex flex-col px-3 py-2 shadow-sm',
        )}
        {...getItemProps({ item, index })}
      >
        <span>{item.title}</span>
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

  function handleStateChange(change: UseComboboxStateChange<Entry>) {
    if (change.type === useCombobox.stateChangeTypes.InputKeyDownEnter) {
      if (change?.selectedItem == null) {
        navigateToSearchPage();
      }
    }
  }

  return (
    <form ref={formRef} id={id} action="" role="search" onSubmit={handleSubmit}>
      <ComboBox
        id={`${id}-combobox`}
        items={entries}
        onInputValueChange={handleInputValueChange}
        onSelectedItemChange={handleSelectedItemChange}
        itemToString={itemToString}
        renderInput={renderInput}
        renderMenu={renderMenu}
        renderMenuItem={renderMenuItem}
        onPageChange={handlePageChange}
        onStateChange={handleStateChange}
      />
    </form>
  );
}
