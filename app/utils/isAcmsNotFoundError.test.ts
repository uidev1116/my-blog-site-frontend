import { describe, expect, it } from 'vitest';
import isAcmsNotFoundError from './isAcmsNotFoundError';

describe('isAcmsNotFoundError', () => {
  it('404 のメッセージを持つ Error なら true', () => {
    expect(
      isAcmsNotFoundError(new Error('fetch API response status: 404')),
    ).toBe(true);
  });

  it('404 以外のステータスは false', () => {
    expect(
      isAcmsNotFoundError(new Error('fetch API response status: 500')),
    ).toBe(false);
    expect(
      isAcmsNotFoundError(new Error('fetch API response status: 4040')),
    ).toBe(false);
  });

  it('Error 以外は false', () => {
    expect(isAcmsNotFoundError('response status: 404')).toBe(false);
    expect(isAcmsNotFoundError(null)).toBe(false);
  });
});
