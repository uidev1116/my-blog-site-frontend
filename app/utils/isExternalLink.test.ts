import { afterEach, describe, expect, it, vi } from 'vitest';
import isExternalLink from './isExternalLink';

describe('isExternalLink', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('スキームを持たない相対パスは外部リンクではない', () => {
    expect(isExternalLink('/blog/')).toBe(false);
    expect(isExternalLink('blog/a')).toBe(false);
  });

  it('現在のホストと同じ URL は外部リンクではない', () => {
    vi.stubGlobal('location', { hostname: 'example.com' });
    expect(isExternalLink('https://example.com/a')).toBe(false);
    expect(isExternalLink('http://example.com:3000/a')).toBe(false);
  });

  it('別ホストの URL は外部リンク', () => {
    vi.stubGlobal('location', { hostname: 'example.com' });
    expect(isExternalLink('https://other.example.org/a')).toBe(true);
  });

  it('スキーム相対 (:) 形式も判定対象になる', () => {
    vi.stubGlobal('location', { hostname: 'example.com' });
    expect(isExternalLink('://other.org')).toBe(true);
  });
});
