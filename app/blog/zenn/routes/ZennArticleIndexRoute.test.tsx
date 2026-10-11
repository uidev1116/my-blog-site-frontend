// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ZennArticle } from '@/app/types';

vi.mock('next/link', async () => ({
  default: (await import('@/app/test-utils/next-link')).LinkMock,
}));
vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});

import ZennArticleIndexRoute from './ZennArticleIndexRoute';

const article = {
  id: 1,
  title: 'Zenn 記事',
  url: 'https://zenn.dev/u/articles/a',
  publishedAt: new Date(2020, 0, 1),
  articleType: 'tech',
} as ZennArticle;

describe('ZennArticleIndexRoute', () => {
  it('Zenn タブを現在地にする', () => {
    render(<ZennArticleIndexRoute articles={[article]} nextPage={null} />);
    expect(screen.getByRole('link', { name: 'Zenn' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      '/blog/',
    );
  });

  it('記事が無ければ EmptyState を表示する', () => {
    render(<ZennArticleIndexRoute articles={[]} nextPage={null} />);
    expect(
      screen.getByText('お探しの記事が見つかりませんでした。'),
    ).toBeInTheDocument();
  });

  it('1 ページ目で次のページがあれば「次へ」だけを表示する', () => {
    render(<ZennArticleIndexRoute articles={[article]} nextPage={2} />);
    expect(screen.getByRole('link', { name: '次へ' })).toHaveAttribute(
      'href',
      '/blog/zenn/page/2',
    );
    expect(screen.queryByRole('link', { name: '前へ' })).toBeNull();
  });

  it('途中のページでは「前へ」と「次へ」を表示する', () => {
    render(
      <ZennArticleIndexRoute articles={[article]} nextPage={4} page={3} />,
    );
    expect(screen.getByRole('link', { name: '前へ' })).toHaveAttribute(
      'href',
      '/blog/zenn/page/2',
    );
    expect(screen.getByRole('link', { name: '次へ' })).toHaveAttribute(
      'href',
      '/blog/zenn/page/4',
    );
  });

  it('最後のページでは「前へ」だけを表示する', () => {
    render(
      <ZennArticleIndexRoute articles={[article]} nextPage={null} page={2} />,
    );
    expect(screen.getByRole('link', { name: '前へ' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '次へ' })).toBeNull();
  });
});
