// @vitest-environment jsdom
import { expect, it } from 'vitest';
import isBrowser from './isBrowser';

it('window がある環境では true', () => {
  expect(isBrowser).toBe(true);
});
