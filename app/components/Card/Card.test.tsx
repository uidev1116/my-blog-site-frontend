// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Card, CardBody, CardFooter, CardHeader } from '.';

describe('Card', () => {
  it('div として子要素を描画し、className を追加する', () => {
    render(
      <Card data-testid="c" className="extra">
        中身
      </Card>,
    );
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('extra', 'rounded-lg');
    expect(el).toHaveTextContent('中身');
  });

  it('as で要素を差し替えられる', () => {
    render(
      <Card as="section" data-testid="c">
        a
      </Card>,
    );
    expect(screen.getByTestId('c').tagName).toBe('SECTION');
  });

  it.each([
    ['CardHeader', CardHeader],
    ['CardBody', CardBody],
    ['CardFooter', CardFooter],
  ])('%s は子要素・属性・ref をそのまま渡す', (_name, Component) => {
    const ref = createRef<never>();
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Component ref={ref as any} data-testid="x" className="y">
        中身
      </Component>,
    );
    const el = screen.getByTestId('x');
    expect(el).toHaveClass('y');
    expect(el).toHaveTextContent('中身');
    expect(ref.current).toBe(el);
  });

  it.each([
    ['CardHeader', CardHeader],
    ['CardBody', CardBody],
    ['CardFooter', CardFooter],
  ])('%s は as で要素を差し替えられる', (_name, Component) => {
    render(
      <Component as="p" data-testid="x">
        a
      </Component>,
    );
    expect(screen.getByTestId('x').tagName).toBe('P');
  });
});
