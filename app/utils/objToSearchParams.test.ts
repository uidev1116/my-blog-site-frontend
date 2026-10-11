import { describe, expect, it } from 'vitest';
import objToSearchParams from './objToSearchParams';

describe('objToSearchParams', () => {
  it('文字列と配列を URLSearchParams に変換する', () => {
    const params = objToSearchParams({ keyword: 'a', tag: ['x', 'y'] });
    expect(params.get('keyword')).toBe('a');
    expect(params.getAll('tag')).toEqual(['x', 'y']);
  });

  it('空オブジェクトは空の URLSearchParams', () => {
    expect(objToSearchParams({}).toString()).toBe('');
  });
});
