'use client';

import { Fragment, Suspense } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import {
  useCombobox,
  UseComboboxActions,
  type UseComboboxProps,
} from 'downshift';
import { usePageChange } from '@/app/hooks';

type Props<T> = UseComboboxProps<T> & {
  className?: string;
  renderInput: (
    getInputProps: ReturnType<typeof useCombobox>['getInputProps'],
  ) => React.ReactNode;
  renderMenu: (
    isOpen: ReturnType<typeof useCombobox>['isOpen'],
    items: T[],
    getMenuProps: ReturnType<typeof useCombobox>['getMenuProps'],
    options: ReturnType<Props<T>['renderOption']>,
  ) => React.ReactNode;
  renderMenuItem: (
    getItemProps: ReturnType<typeof useCombobox>['getItemProps'],
    item: T,
    index: number,
    highlightedIndex: number,
    selectedItem: T | null,
  ) => React.ReactNode;
  onPageChange?: (
    pathname: string,
    searchParams: ReadonlyURLSearchParams,
    actions: UseComboboxActions<T>,
  ) => void;
};

function ComboBox<T>({
  className = 'relative',
  renderInput,
  renderMenu,
  renderMenuItem,
  onPageChange = () => {},
  ...useComboboxProps
}: Props<T>) {
  const { items = [] } = useComboboxProps;
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    closeMenu,
    openMenu,
    selectItem,
    setHighlightedIndex,
    setInputValue,
    toggleMenu,
    reset,
  } = useCombobox<T>(useComboboxProps);

  const actions = {
    closeMenu,
    openMenu,
    selectItem,
    setHighlightedIndex,
    setInputValue,
    toggleMenu,
    reset,
  };

  usePageChange((pathname, searchParams) =>
    onPageChange(pathname, searchParams, actions),
  );

  function renderMenuItems() {
    return items.map((item, index) => (
      <Fragment key={index}>
        {renderMenuItem(
          getItemProps,
          item,
          index,
          highlightedIndex,
          selectedItem,
        )}
      </Fragment>
    ));
  }

  return (
    <div className={className}>
      {renderInput(getInputProps)}
      {renderMenu(isOpen, items, getMenuProps, renderMenuItems())}
    </div>
  );
}

export default function ComboBoxSuspense<T>(props: Props<T>) {
  return (
    <Suspense fallback={null}>
      <ComboBox<T> {...props} />
    </Suspense>
  );
}
