// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import Footer from './Footer';

const nav = (overrides = {}) => ({
  label: 'プライバシー',
  level: 1,
  url: '/privacy/',
  target: '' as const,
  ...overrides,
});

// async Server Component は関数として呼び出して結果を描画する
const renderFooter = async (
  navigations: Parameters<typeof Footer>[0]['navigations'],
) => render(await Footer({ navigations }));

describe('Footer', () => {
  it('著作権表記とサイトホストへのリンクを表示する', async () => {
    await renderFooter([]);
    expect(screen.getByText(/All Rights Reserved/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'example.com' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('ナビゲーションが無ければリストを出さない', async () => {
    await renderFooter([]);
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('ナビゲーションをリンクとして並べ、_blank のときだけ rel を付ける', async () => {
    await renderFooter([
      nav(),
      nav({ label: '外部', url: 'https://x.com', target: '_blank' }),
    ]);

    const internal = screen.getByRole('link', { name: 'プライバシー' });
    expect(internal).toHaveAttribute('href', '/privacy/');
    expect(internal).not.toHaveAttribute('target');
    expect(internal).not.toHaveAttribute('rel');

    const external = screen.getByRole('link', { name: '外部' });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noreferrer');
  });
});
