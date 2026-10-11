// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('status ロールと読み上げ用テキストを持つ', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('h-4', 'w-4');
    expect(el).toHaveTextContent('Loading...');
  });

  it('className と ref を指定できる', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spinner ref={ref} className="h-8 w-8" />);
    expect(screen.getByRole('status')).toHaveClass('h-8');
    expect(ref.current).toBe(screen.getByRole('status'));
  });
});
