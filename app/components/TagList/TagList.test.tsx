// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

import TagList from './TagList';

const tags = [
  { name: 'react', path: '/blog/tag/react/' },
  { name: 'next', path: '/blog/tag/next/' },
];

describe('TagList', () => {
  it('タグを # 付きで並べる(リンクなし)', () => {
    render(<TagList tags={tags} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('isLink ならタグごとにリンクにする', () => {
    render(<TagList tags={tags} isLink />);
    expect(screen.getByRole('link', { name: '#react' })).toHaveAttribute(
      'href',
      '/blog/tag/react/',
    );
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('タグが無ければ空のリスト', () => {
    render(<TagList tags={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('tags を省略しても描画できる', () => {
    // @ts-expect-error tags の省略時の既定値を確認する
    render(<TagList />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
