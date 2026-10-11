import { describe, expect, it } from 'vitest';
import isNumber from './isNumber';
import isObject from './isObject';
import isString from './isString';
import noop from './noop';

describe('型ガード', () => {
  it('isNumber', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber('1')).toBe(false);
  });

  it('isString', () => {
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
  });

  it('isObject', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject('a')).toBe(false);
  });

  it('noop は何も返さない', () => {
    expect(noop()).toBeUndefined();
  });
});
