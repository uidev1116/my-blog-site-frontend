// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({
  pathname: '/',
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
}));
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

import NavLink from './NavLink';

beforeEach(() => {
  nav.pathname = '/';
  nav.searchParams = new URLSearchParams();
});

describe('NavLink', () => {
  it('href・target・rel・子要素を渡してリンクを描画する', () => {
    render(
      <NavLink href="https://x.com/" target="_blank" rel="noreferrer">
        外部
      </NavLink>,
    );
    const link = screen.getByRole('link', { name: '外部' });
    expect(link).toHaveAttribute('href', 'https://x.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('ホーム (/) は完全一致のときだけアクティブ', () => {
    render(<NavLink href="/">ホーム</NavLink>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('bg-primary');
  });

  it('ホーム (/) は他のページではアクティブにならない', () => {
    nav.pathname = '/blog/';
    render(<NavLink href="/">ホーム</NavLink>);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('aria-current');
    expect(link).not.toHaveClass('bg-primary');
    expect(link).toHaveClass('text-gray-900');
  });

  it('それ以外は前方一致でアクティブ(完全一致でなければ aria-current は付かない)', () => {
    nav.pathname = '/blog/a.html';
    render(<NavLink href="/blog/">ブログ</NavLink>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-primary');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('無関係なページでは非アクティブ', () => {
    nav.pathname = '/profile/';
    render(<NavLink href="/blog/">ブログ</NavLink>);
    expect(screen.getByRole('link')).not.toHaveClass('bg-primary');
  });
});
