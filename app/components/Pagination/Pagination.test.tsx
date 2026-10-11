// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('keyword=cms&page=2'),
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

const props = {
  currentPage: 1,
  pages: [
    { page: 1, path: '/blog/page/1/' },
    { page: 2, path: '/blog/page/2/' },
  ],
};

describe('Pagination', () => {
  it('既定では、現在のクエリ文字列を各リンクに引き継ぐ', async () => {
    const { default: Pagination } = await import('./Pagination');
    render(<Pagination {...props} />);

    expect(screen.getByRole('link', { name: '2' }).getAttribute('href')).toBe(
      '/blog/page/2/?keyword=cms&page=2',
    );
  });

  it('appendQuery が false なら、path をそのまま使う', async () => {
    const { default: Pagination } = await import('./Pagination');
    render(<Pagination {...props} appendQuery={false} />);

    expect(screen.getByRole('link', { name: '2' }).getAttribute('href')).toBe(
      '/blog/page/2/',
    );
  });
});
