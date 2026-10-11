// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Entry } from '@/app/types';

vi.mock('next/dynamic', async () => {
  const { dynamicMock } = await import('@/app/test-utils/next-dynamic');
  return { default: dynamicMock };
});
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import EntryList from './EntryList';

const entry = (overrides: Partial<Entry> = {}) =>
  ({
    id: 1,
    title: '記事タイトル',
    path: '/blog/a.html',
    createdAt: new Date(2020, 0, 1),
    summary: '要約です',
    tags: [{ name: 'react', path: '/blog/tag/react/' }],
    ...overrides,
  }) as Entry;

describe('EntryList', () => {
  it('記事のタイトル・要約・タグ・日付を描画し、記事へのリンクにする', async () => {
    render(<EntryList entries={[entry()]} />);

    expect(
      screen.getByRole('heading', { name: '記事タイトル' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/a.html');
    expect(screen.getByText('要約です')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(await screen.findByText('2020/01/01')).toBeInTheDocument();
  });

  it('要約もタグも無い記事では該当部分を出さない', () => {
    render(<EntryList entries={[entry({ summary: '', tags: [] })]} />);
    expect(screen.queryByText('要約です')).toBeNull();
    expect(screen.queryByText(/^#/)).toBeNull();
  });

  it('tags が undefined の記事でも描画できる', () => {
    render(<EntryList entries={[entry({ tags: undefined })]} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('記事ごとに 1 件の li を描画し、className を指定できる', () => {
    const { container } = render(
      <EntryList
        entries={[
          entry({ id: 1, tags: [] }),
          entry({ id: 2, title: '二つ目', tags: [] }),
        ]}
        className="custom"
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(container.querySelector('ul')).toHaveClass('custom');
  });

  it('entries を省略すると空のリスト', () => {
    // @ts-expect-error entries の省略時の既定値を確認する
    render(<EntryList />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
