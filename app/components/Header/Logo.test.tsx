// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import ColorThemeContextProvider from '@/app/stores/color-theme';
import Logo from './Logo';

const renderLogo = () =>
  render(
    <ColorThemeContextProvider>
      <Logo />
    </ColorThemeContextProvider>,
  );

beforeEach(() => {
  nav.pathname = '/';
  localStorage.clear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

describe('Logo', () => {
  it('トップページでは h1 の中にトップへのリンクを置く', () => {
    renderLogo();
    expect(screen.getByRole('heading', { level: 1 })).toContainElement(
      screen.getByRole('link'),
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });

  it('トップ以外のページでは見出しにしない', () => {
    nav.pathname = '/blog/';
    renderLogo();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('ライトモードではライト用ロゴ', () => {
    renderLogo();
    expect(screen.getByAltText('UiDev logo')).toHaveAttribute(
      'src',
      '/logo-light.svg',
    );
  });

  it('ダークモードではダーク用ロゴ', () => {
    localStorage.setItem('color-theme', '"dark"');
    renderLogo();
    expect(screen.getByAltText('UiDev logo')).toHaveAttribute(
      'src',
      '/logo-dark.svg',
    );
  });
});
