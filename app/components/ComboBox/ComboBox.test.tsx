// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({
  searchParams: new URLSearchParams('keyword=x'),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/blog/search/',
  useSearchParams: () => nav.searchParams,
}));

import ComboBox from './ComboBox';

const items = [{ title: 'りんご' }, { title: 'ばなな' }];
type Item = (typeof items)[number];

function setup(
  props: Partial<React.ComponentProps<typeof ComboBox<Item>>> = {},
) {
  return render(
    <ComboBox<Item>
      items={items}
      itemToString={(i) => i?.title ?? ''}
      renderInput={(getInputProps) => (
        <input aria-label="検索" {...getInputProps()} />
      )}
      renderMenu={(isOpen, _items, _value, getMenuProps, menuItems) => (
        <ul {...getMenuProps()} data-open={isOpen}>
          {isOpen && menuItems}
        </ul>
      )}
      renderMenuItem={(getItemProps, item, index, highlighted) => (
        <li
          {...getItemProps({ item, index })}
          data-highlighted={highlighted === index}
        >
          {item.title}
        </li>
      )}
      {...props}
    />,
  );
}

describe('ComboBox', () => {
  it('入力欄を描画し、初期状態ではメニューを閉じる', () => {
    setup({ className: 'custom' });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('開いたメニューに項目を並べ、選択すると onSelectedItemChange が呼ばれる', () => {
    const onSelectedItemChange = vi.fn();
    setup({ onSelectedItemChange });

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('option')).toHaveLength(2);

    fireEvent.click(screen.getByRole('option', { name: 'ばなな' }));
    expect(onSelectedItemChange).toHaveBeenCalledWith(
      expect.objectContaining({ selectedItem: items[1] }),
    );
  });

  it('items を省略しても描画できる', () => {
    setup({ items: undefined });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('ページ遷移時に onPageChange へパス・クエリ・操作関数を渡す', () => {
    const onPageChange = vi.fn();
    setup({ onPageChange });
    expect(onPageChange).toHaveBeenCalledWith(
      '/blog/search/',
      nav.searchParams,
      expect.objectContaining({
        reset: expect.any(Function),
        setInputValue: expect.any(Function),
        closeMenu: expect.any(Function),
        openMenu: expect.any(Function),
        selectItem: expect.any(Function),
        toggleMenu: expect.any(Function),
        setHighlightedIndex: expect.any(Function),
      }),
    );
  });
});
