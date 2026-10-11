import { describe, expect, it } from 'vitest';
import range from './range';

describe('range', () => {
  it('start から end までを含む連番を返す', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('step を指定できる', () => {
    expect(range(0, 10, 5)).toEqual([0, 5, 10]);
  });

  it('start と end が同じなら 1 要素', () => {
    expect(range(3, 3)).toEqual([3]);
  });
});
