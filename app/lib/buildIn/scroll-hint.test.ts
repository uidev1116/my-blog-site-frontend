import { beforeEach, expect, it, vi } from 'vitest';

const { ScrollHint } = vi.hoisted(() => ({ ScrollHint: vi.fn() }));
vi.mock('scroll-hint', () => ({ default: ScrollHint }));
vi.mock('scroll-hint/css/scroll-hint.css', () => ({}));

import setupScrollHint from './scroll-hint';

beforeEach(() => ScrollHint.mockClear());

it('既定オプションに引数をマージして ScrollHint を初期化する', () => {
  setupScrollHint('.x', { applyToParents: true });
  expect(ScrollHint).toHaveBeenCalledWith(
    '.x',
    expect.objectContaining({
      applyToParents: true,
      suggestClass: 'is-active',
      i18n: { scrollable: 'スクロールできます' },
    }),
  );
});

it('オプション省略時は既定値を使う', () => {
  setupScrollHint('.x');
  expect(ScrollHint.mock.calls[0][1]).toMatchObject({ applyToParents: false });
});
