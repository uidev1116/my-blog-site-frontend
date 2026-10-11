import { isValidElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ getMetadata: vi.fn() }));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
// 検索結果の取得・表示は、BlogSearchRoute のテストで確認する
vi.mock('./BlogSearchRoute', () => ({ default: () => null }));

import BlogSearchPage, { generateMetadata } from './page';

beforeEach(() => vi.clearAllMocks());

describe('/blog/search', () => {
  it('ページ自体は静的(検索パラメータを読まない)で、ブログのメタデータを使う', async () => {
    m.getMetadata.mockResolvedValue({ title: 'ブログ' });

    const meta = await generateMetadata();

    expect(m.getMetadata).toHaveBeenCalledWith({ blog: 'blog' });
    expect(meta.title).toBe('ブログ');
  });

  it('検索エンジンに載せない(noindex)が、リンクはたどらせる', async () => {
    m.getMetadata.mockResolvedValue({ robots: { index: true } });

    const meta = await generateMetadata();

    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it('useSearchParams を使う BlogSearchRoute を、Suspense で包む(静的書き出しの要件)', () => {
    const el = BlogSearchPage();

    expect(isValidElement(el)).toBe(true);
    // Suspense の fallback は、JS が動く前の静的 HTML に出る
    expect(el.props.fallback).toBeTruthy();
    expect(isValidElement(el.props.children)).toBe(true);
  });
});
