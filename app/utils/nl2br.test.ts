import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import nl2br from './nl2br';
import reactNl2br from './react-nl2br';

describe('nl2br', () => {
  it('改行を <br /> に置き換える', () => {
    expect(nl2br('a\nb\r\nc\rd')).toBe('a<br />b<br />c<br />d');
  });

  it('文字列以外はそのまま返す', () => {
    const value = 1 as unknown as string;
    expect(nl2br(value)).toBe(1);
  });
});

describe('react-nl2br', () => {
  it('行の間に br 要素を挟み、末尾には付けない', () => {
    const nodes = reactNl2br('a\nb');
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toBe('a');
    expect(isValidElement(nodes[1])).toBe(true);
    expect(nodes[2]).toBe('b');
  });

  it('改行がなければ 1 要素', () => {
    expect(reactNl2br('a')).toEqual(['a']);
  });
});
