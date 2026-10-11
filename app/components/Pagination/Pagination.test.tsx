// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => nav.searchParams }));
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

import Pagination from './Pagination';

const pages = [
  { page: 1, path: '/blog/' },
  { page: 2, path: '/blog/page/2/' },
  { page: 3, path: '/blog/page/3/' },
];

beforeEach(() => {
  nav.searchParams = new URLSearchParams();
});

describe('Pagination', () => {
  it('現在のページはリンクにせず、他のページはリンクにする', () => {
    render(<Pagination currentPage={2} pages={pages} />);

    expect(
      screen.getByRole('navigation', { name: 'Page navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2').tagName).toBe('SPAN');
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/blog/',
    );
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '/blog/page/3/',
    );
  });

  it('前へ / 次へ のリンクを描画する', () => {
    render(
      <Pagination
        currentPage={2}
        pages={pages}
        previous={{ path: '/blog/', num: 10, page: 1 }}
        next={{ path: '/blog/page/3/', num: 10, page: 3 }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/blog/',
    );
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/blog/page/3/',
    );
  });

  it('前後が無ければ Previous / Next を出さない', () => {
    render(<Pagination currentPage={1} pages={pages} />);
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull();
  });

  it('ページが空でも描画できる', () => {
    render(<Pagination currentPage={1} pages={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('現在のクエリ文字列を全リンクに引き継ぐ', () => {
    nav.searchParams = new URLSearchParams('keyword=abc');
    render(
      <Pagination
        currentPage={2}
        pages={pages}
        previous={{ path: '/blog/', num: 10, page: 1 }}
        next={{ path: '/blog/page/3/', num: 10, page: 3 }}
      />,
    );
    screen.getAllByRole('link').forEach((link) => {
      expect(link.getAttribute('href')).toMatch(/\?keyword=abc$/);
    });
  });
});

describe('Pagination の appendQuery', () => {
  it('既定では、現在のクエリ文字列を各リンクに引き継ぐ', () => {
    nav.searchParams = new URLSearchParams('keyword=cms&page=2');
    render(<Pagination currentPage={1} pages={pages} />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'href',
      '/blog/page/2/?keyword=cms&page=2',
    );
  });

  it('appendQuery が false なら、path をそのまま使う(リンク側でクエリを組み立てる場合)', () => {
    nav.searchParams = new URLSearchParams('keyword=cms&page=2');
    render(<Pagination currentPage={1} pages={pages} appendQuery={false} />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'href',
      '/blog/page/2/',
    );
  });
});
