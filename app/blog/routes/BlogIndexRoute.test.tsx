// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Entry } from '@/app/types';

vi.mock('next/link', async () => ({
  default: (await import('@/app/test-utils/next-link')).LinkMock,
}));
vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

import BlogIndexRoute from './BlogIndexRoute';

const entry = {
  id: 1,
  title: '記事A',
  path: '/blog/a.html',
  createdAt: new Date(2020, 0, 1),
  summary: '',
  tags: [],
} as unknown as Entry;

const pagination = {
  currentPage: 1,
  pages: [
    { page: 1, path: '/blog/' },
    { page: 2, path: '/blog/page/2/' },
  ],
};

describe('BlogIndexRoute', () => {
  it('Blog / Zenn のタブを表示し、Blog を現在地にする', () => {
    render(<BlogIndexRoute entries={[entry]} />);
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Zenn' })).toHaveAttribute(
      'href',
      '/blog/zenn/',
    );
  });

  it('記事が無ければ EmptyState を表示する', () => {
    render(<BlogIndexRoute entries={[]} pagination={pagination} />);
    expect(
      screen.getByText('お探しの記事が見つかりませんでした。'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Page navigation' }),
    ).toBeNull();
  });

  it('記事一覧とページネーションを表示する', () => {
    render(<BlogIndexRoute entries={[entry]} pagination={pagination} />);
    expect(screen.getByRole('heading', { name: '記事A' })).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Page navigation' }),
    ).toBeInTheDocument();
  });

  it('pages が空ならページネーションを出さない', () => {
    render(
      <BlogIndexRoute
        entries={[entry]}
        pagination={{ currentPage: 1, pages: [] }}
      />,
    );
    expect(
      screen.queryByRole('navigation', { name: 'Page navigation' }),
    ).toBeNull();
  });

  it('pagination を渡さなければページネーションを出さない', () => {
    render(<BlogIndexRoute entries={[entry]} />);
    expect(
      screen.queryByRole('navigation', { name: 'Page navigation' }),
    ).toBeNull();
  });

  it('tag を渡すとタグ名と「全て表示する」リンクを表示する', () => {
    render(<BlogIndexRoute entries={[entry]} tag="react" />);
    expect(screen.getByText('タグ:')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '全て表示する' })).toHaveAttribute(
      'href',
      '/blog/',
    );
  });

  it('tag が無ければタグ表示を出さない', () => {
    render(<BlogIndexRoute entries={[entry]} />);
    expect(screen.queryByText('タグ:')).toBeNull();
  });
});
