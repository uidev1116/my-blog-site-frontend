// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/components', () => ({
  Collapse: ({
    toggle,
    children,
  }: {
    toggle: string;
    children: React.ReactNode;
  }) => (
    <button data-testid="collapse" data-toggle={toggle}>
      {children}
    </button>
  ),
  ThemeColorSwitcher: () => <div data-testid="theme-switcher" />,
  BlogSearchForm: ({ id }: { id: string }) => <form data-testid={id} />,
}));
vi.mock('./Logo', () => ({ default: () => <div data-testid="logo" /> }));
vi.mock('./NavLink', () => ({
  default: ({
    href,
    target,
    rel,
    children,
  }: {
    href: string;
    target?: string;
    rel?: string;
    children: React.ReactNode;
  }) => (
    <a href={href} target={target} rel={rel}>
      {children}
    </a>
  ),
}));

import Header from './Header';

const nav = (overrides = {}) => ({
  label: 'ブログ',
  level: 1,
  url: '/blog/',
  target: '' as const,
  ...overrides,
});

// async Server Component は関数として呼び出して結果を描画する
const renderHeader = async (
  navigations: Parameters<typeof Header>[0]['navigations'],
) => render(await Header({ navigations }));

describe('Header', () => {
  it('ロゴ・テーマ切り替え・モバイル/デスクトップ用の検索フォームを描画する', async () => {
    await renderHeader([]);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getAllByTestId('theme-switcher')).toHaveLength(2);
    expect(screen.getByTestId('blog-search-form')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-blog-search-form')).toBeInTheDocument();
    screen
      .getAllByTestId('collapse')
      .forEach((c) =>
        expect(c).toHaveAttribute('data-toggle', 'navbar-search'),
      );
  });

  it('ナビゲーションが無ければリストを出さない', async () => {
    await renderHeader([]);
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('ナビゲーションをリンクとして並べ、_blank のときだけ rel を付ける', async () => {
    await renderHeader([
      nav(),
      nav({ label: '外部', url: 'https://x.com', target: '_blank' }),
    ]);
    const list = screen.getByRole('list');
    const internal = within(list).getByRole('link', { name: 'ブログ' });
    expect(internal).not.toHaveAttribute('target');
    expect(internal).not.toHaveAttribute('rel');
    const external = within(list).getByRole('link', { name: '外部' });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noreferrer');
  });
});
