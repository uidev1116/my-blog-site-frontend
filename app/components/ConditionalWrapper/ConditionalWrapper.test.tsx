// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ConditionalWrapper from './ConditionalWrapper';

const wrapper = (children: React.ReactNode) => (
  <div data-testid="wrap">{children}</div>
);

describe('ConditionalWrapper', () => {
  it('condition が true なら wrapper で包む', () => {
    render(
      <ConditionalWrapper condition wrapper={wrapper}>
        中身
      </ConditionalWrapper>,
    );
    expect(screen.getByTestId('wrap')).toHaveTextContent('中身');
  });

  it('condition が false ならそのまま描画する', () => {
    render(
      <ConditionalWrapper condition={false} wrapper={wrapper}>
        中身
      </ConditionalWrapper>,
    );
    expect(screen.queryByTestId('wrap')).toBeNull();
    expect(screen.getByText('中身')).toBeInTheDocument();
  });
});
