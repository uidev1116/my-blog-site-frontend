import { describe, expect, it } from 'vitest';
import deleteNewLine from './deleteNewLine';

describe('deleteNewLine', () => {
  it('LF と CRLF を取り除く', () => {
    expect(deleteNewLine('a\nb\r\nc')).toBe('abc');
  });

  it('改行がなければそのまま返す', () => {
    expect(deleteNewLine('abc')).toBe('abc');
  });
});
