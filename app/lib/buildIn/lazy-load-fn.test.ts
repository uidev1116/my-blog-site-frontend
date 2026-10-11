// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';

const { observe, lozad } = vi.hoisted(() => {
  const observe = vi.fn();
  return { observe, lozad: vi.fn(() => ({ observe })) };
});
vi.mock('lozad', () => ({ default: lozad }));

import lazyLoad from './lazy-load-fn';

beforeEach(() => {
  document.body.innerHTML = `
    <div class="t" data-lazy="true" id="lazy"></div>
    <div class="t" id="eager"></div>`;
  lozad.mockClear();
  observe.mockClear();
});

it('遅延対象でない要素だけ即実行し、遅延対象は lozad の loaded で実行する', () => {
  const run = vi.fn();
  const isLazy = (el: HTMLElement) => el.dataset.lazy === 'true';

  lazyLoad('.t', isLazy, run);

  expect(observe).toHaveBeenCalled();
  expect(run).toHaveBeenCalledTimes(1);
  expect(run).toHaveBeenCalledWith(document.getElementById('eager'));

  const { loaded } = (
    lozad.mock.calls[0] as unknown as [
      string,
      { loaded: (el: HTMLElement) => void },
    ]
  )[1];
  loaded(document.getElementById('lazy')!);
  loaded(document.getElementById('eager')!);
  expect(run).toHaveBeenCalledTimes(2);
  expect(run).toHaveBeenLastCalledWith(document.getElementById('lazy'));
});
