// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({
  pathname: '/a',
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
}));

import usePageChange from './usePageChange';

beforeEach(() => {
  nav.pathname = '/a';
  nav.searchParams = new URLSearchParams();
});

it('マウント時に現在のパスで呼ばれる', () => {
  const onChange = vi.fn();
  renderHook(() => usePageChange(onChange));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('/a', nav.searchParams);
});

it('パスが変わると再度呼ばれる', () => {
  const onChange = vi.fn();
  const { rerender } = renderHook(() => usePageChange(onChange));

  nav.pathname = '/b';
  rerender();

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenLastCalledWith('/b', nav.searchParams);
});

it('パスもクエリも変わらなければ再実行しない', () => {
  const onChange = vi.fn();
  const { rerender } = renderHook(() => usePageChange(onChange));
  rerender();
  expect(onChange).toHaveBeenCalledTimes(1);
});
