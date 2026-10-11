// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('子要素が無ければ既定のメッセージを表示する', () => {
    render(<EmptyState />);
    expect(
      screen.getByText('お探しの記事が見つかりませんでした。'),
    ).toBeInTheDocument();
  });

  it('子要素を渡すとそれを表示する', () => {
    render(<EmptyState>空です</EmptyState>);
    expect(screen.getByText('空です')).toBeInTheDocument();
    expect(screen.queryByText(/お探しの記事/)).toBeNull();
  });
});
