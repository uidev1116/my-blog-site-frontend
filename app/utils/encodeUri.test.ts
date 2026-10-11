import { describe, expect, it } from 'vitest';
import encodeUri from './encodeUri';

describe('encodeUri', () => {
  it("encodeURIComponent が残す記号 !'()* もパーセントエンコードする", () => {
    expect(encodeUri("!'()*")).toBe('%21%27%28%29%2a');
  });

  it('日本語や予約文字をエンコードする', () => {
    expect(encodeUri('あ&b')).toBe('%E3%81%82%26b');
  });

  it('数値と真偽値を文字列として扱う', () => {
    expect(encodeUri(1)).toBe('1');
    expect(encodeUri(true)).toBe('true');
  });
});
