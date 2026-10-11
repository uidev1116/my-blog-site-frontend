import { describe, expect, it } from 'vitest';
import isDateString from './isDateString';

describe('isDateString', () => {
  it('日付として解釈できる文字列は true', () => {
    expect(isDateString('2026-01-01')).toBe(true);
    expect(isDateString('2026-01-01T00:00:00Z')).toBe(true);
  });

  it('解釈できない文字列は false', () => {
    expect(isDateString('not a date')).toBe(false);
    expect(isDateString('')).toBe(false);
  });
});
