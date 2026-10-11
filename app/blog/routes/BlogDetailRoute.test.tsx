// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Entry } from '@/app/types';

vi.mock('next/link', async () => ({
  default: (await import('@/app/test-utils/next-link')).LinkMock,
}));
vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});
/* eslint-disable @next/next/no-img-element */
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

import BlogDetailRoute from './BlogDetailRoute';

const entry = (overrides: Partial<Entry> = {}) =>
  ({
    id: 1,
    title: '記事タイトル',
    path: '/blog/a.html',
    createdAt: new Date(2020, 0, 2),
    summary: '',
    tags: [{ name: 'react', path: '/blog/tag/react/' }],
    body: '<p>本文です</p>',
    ...overrides,
  }) as Entry;

describe('BlogDetailRoute', () => {
  it('タイトル・公開日・タグ・目次・本文・共有ボタンを表示する', () => {
    render(<BlogDetailRoute entry={entry()} relationalEntries={[]} />);

    expect(
      screen.getByRole('heading', { level: 1, name: '記事タイトル' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2020/01/02')).toHaveAttribute(
      'datetime',
      '2020-01-02 00:00:00',
    );
    expect(screen.getByRole('link', { name: '#react' })).toHaveAttribute(
      'href',
      '/blog/tag/react/',
    );
    expect(
      screen.getByRole('navigation', { name: '目次' }),
    ).toBeInTheDocument();
    expect(screen.getByText('本文です')).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Share social media' }),
    ).toBeInTheDocument();
  });

  it('共有 URL は BASE_URL を基準にした記事の絶対 URL', () => {
    render(<BlogDetailRoute entry={entry()} relationalEntries={[]} />);
    const share = within(
      screen.getByRole('complementary', { name: 'Share social media' }),
    );
    const [x] = share.getAllByRole('link');
    expect(new URL(x.getAttribute('href')!).searchParams.get('url')).toBe(
      'https://example.com/blog/a.html',
    );
  });

  it('タグも本文も無ければ該当部分を出さない', () => {
    render(
      <BlogDetailRoute
        entry={entry({ tags: [], body: '' })}
        relationalEntries={[]}
      />,
    );
    expect(screen.queryByRole('link', { name: '#react' })).toBeNull();
    expect(screen.queryByText('本文です')).toBeNull();
  });

  it('tags が undefined でも表示できる', () => {
    render(
      <BlogDetailRoute
        entry={entry({ tags: undefined })}
        relationalEntries={[]}
      />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('関連記事が無ければメッセージを表示する', () => {
    render(<BlogDetailRoute entry={entry()} relationalEntries={[]} />);
    expect(screen.getByText('関連記事が存在しません')).toBeInTheDocument();
  });

  it('関連記事があれば一覧で表示する', () => {
    const related = entry({
      id: 2,
      title: '関連記事A',
      path: '/blog/b.html',
      tags: [],
    });
    render(<BlogDetailRoute entry={entry()} relationalEntries={[related]} />);
    const aside = within(
      screen.getByRole('complementary', { name: '関連記事' }),
    );
    expect(
      aside.getByRole('heading', { name: '関連記事A' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('関連記事が存在しません')).toBeNull();
  });
});
