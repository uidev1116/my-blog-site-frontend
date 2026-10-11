// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({
  pathname: '/blog/',
  searchParams: new URLSearchParams(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
}));

import useUrlMatch from './useUrlMatch';

const match = (url: string) =>
  renderHook(() => useUrlMatch(new URL(url, 'https://example.com'))).result
    .current;

beforeEach(() => {
  nav.pathname = '/blog/';
  nav.searchParams = new URLSearchParams();
});

describe('useUrlMatch', () => {
  it('パスが完全一致すれば両方 true', () => {
    expect(match('/blog/')).toEqual({ isMatchFull: true, isMatchStart: true });
  });

  it('現在のパスが対象で始まるなら前方一致のみ true', () => {
    nav.pathname = '/blog/a.html';
    expect(match('/blog/')).toEqual({ isMatchFull: false, isMatchStart: true });
  });

  it('無関係なパスは両方 false', () => {
    expect(match('/profile/')).toEqual({
      isMatchFull: false,
      isMatchStart: false,
    });
  });

  it('クエリも含めて比較する', () => {
    nav.pathname = '/blog/search/';
    nav.searchParams = new URLSearchParams('keyword=a');
    expect(match('/blog/search/?keyword=a').isMatchFull).toBe(true);
    expect(match('/blog/search/?keyword=b').isMatchFull).toBe(false);
  });

  it('エンコード済みの URL と、デコード済みのパスを同じものとして扱う', () => {
    nav.pathname = '/blog/tag/日本語/';
    expect(match('/blog/tag/%E6%97%A5%E6%9C%AC%E8%AA%9E/')).toEqual({
      isMatchFull: true,
      isMatchStart: true,
    });
  });

  it('デコード済みの URL と、エンコード済みのパスも同じものとして扱う', () => {
    nav.pathname = '/blog/tag/%E6%97%A5%E6%9C%AC%E8%AA%9E/a/';
    expect(match('/blog/tag/日本語/')).toEqual({
      isMatchFull: false,
      isMatchStart: true,
    });
  });

  it('不正なエンコードでも例外にならない', () => {
    nav.pathname = '/blog/%E0%A4%A/';
    expect(match('/blog/').isMatchStart).toBe(true);
  });
});
