// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('子要素を span で描画する', () => {
    render(<Badge>タグ</Badge>);
    expect(screen.getByText('タグ').tagName).toBe('SPAN');
  });

  it('className を既定のスタイルに追加し、ref と属性を渡す', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="extra" data-testid="b">
        a
      </Badge>,
    );
    const el = screen.getByTestId('b');
    expect(el).toHaveClass('extra', 'rounded');
    expect(ref.current).toBe(el);
  });

  it('as で要素を差し替えられる', () => {
    render(<Badge as="strong">a</Badge>);
    expect(screen.getByText('a').tagName).toBe('STRONG');
  });
});
