// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ZennArticle } from '@/app/types';

vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});

import ZennArticleList from './ZennArticleList';

const article = (overrides: Partial<ZennArticle> = {}) =>
  ({
    id: 1,
    title: 'Zenn 記事',
    url: 'https://zenn.dev/u/articles/a',
    publishedAt: new Date(2020, 0, 1),
    articleType: 'tech',
    ...overrides,
  }) as ZennArticle;

describe('ZennArticleList', () => {
  it('記事を外部リンクとして描画する', async () => {
    render(<ZennArticleList articles={[article()]} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://zenn.dev/u/articles/a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(
      screen.getByRole('heading', { name: 'Zenn 記事' }),
    ).toBeInTheDocument();
    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(await screen.findByText('2020/01/01')).toBeInTheDocument();
  });

  it('className を指定できる', () => {
    const { container } = render(
      <ZennArticleList articles={[article()]} className="custom" />,
    );
    expect(container.querySelector('ul')).toHaveClass('custom');
  });

  it('articles を省略すると空のリスト', () => {
    // @ts-expect-error articles の省略時の既定値を確認する
    render(<ZennArticleList />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
