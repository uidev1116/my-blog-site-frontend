import { describe, expect, it } from 'vitest';
import truncate from './truncate';

describe('truncate', () => {
  it('指定長以下ならそのまま返す', () => {
    expect(truncate('abc', 3)).toBe('abc');
  });

  it('超えたら切り詰めて末尾を付ける', () => {
    expect(truncate('abcdef', 3)).toBe('abc...');
    expect(truncate('abcdef', 3, '…')).toBe('abc…');
  });
});
