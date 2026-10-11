// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { initCollapses, collapse, getInstance } = vi.hoisted(() => {
  const collapse = vi.fn();
  return {
    initCollapses: vi.fn(),
    collapse,
    getInstance: vi.fn(() => ({ collapse })),
  };
});
vi.mock('flowbite', () => ({ initCollapses }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/a',
  useSearchParams: () => new URLSearchParams(),
}));

import Collapse from './Collapse';

beforeEach(() => {
  vi.stubGlobal('FlowbiteInstances', { getInstance });
  initCollapses.mockClear();
  collapse.mockClear();
  getInstance.mockClear();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Collapse', () => {
  it('トグル対象に紐づくボタンを描画する', () => {
    render(
      <Collapse toggle="menu" className="c">
        開く
      </Collapse>,
    );
    const button = screen.getByRole('button', { name: '開く' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-collapse-toggle', 'menu');
    expect(button).toHaveAttribute('aria-controls', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveClass('c');
  });

  it('マウント時に flowbite を初期化し、ページ遷移で閉じる', () => {
    render(<Collapse toggle="menu">開く</Collapse>);
    expect(initCollapses).toHaveBeenCalled();
    expect(getInstance).toHaveBeenCalledWith('Collapse', 'menu');
    expect(collapse).toHaveBeenCalled();
  });
});
