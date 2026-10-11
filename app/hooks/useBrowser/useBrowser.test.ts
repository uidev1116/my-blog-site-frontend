// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import useBrowser from './useBrowser';

it('マウント後に true になる', () => {
  const { result } = renderHook(() => useBrowser());
  expect(result.current).toBe(true);
});
