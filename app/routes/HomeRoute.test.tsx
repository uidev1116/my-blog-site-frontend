// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Entry } from '../types';

vi.mock('next/link', async () => ({
  default: (await import('@/app/test-utils/next-link')).LinkMock,
}));
vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});

import HomeRoute from './HomeRoute';

const entry = {
  id: 1,
  title: '最新記事',
  path: '/blog/a.html',
  createdAt: new Date(2020, 0, 1),
  summary: '',
  tags: [],
} as unknown as Entry;

describe('HomeRoute', () => {
  it('記事が無ければ EmptyState を表示する', () => {
    render(<HomeRoute entries={[]} blogName="ブログ" blogPath="/blog/" />);
    expect(
      screen.getByText('お探しの記事が見つかりませんでした。'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('記事一覧と、ブログ一覧へのリンクを表示する', () => {
    render(<HomeRoute entries={[entry]} blogName="ブログ" blogPath="/blog/" />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '最新記事' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ブログ一覧' })).toHaveAttribute(
      'href',
      '/blog/',
    );
  });
});
