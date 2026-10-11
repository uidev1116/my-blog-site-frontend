import { isValidElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

// app/config が、サイトの URL を import 時に読む
vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
// 取得・表示は、BlogPreviewRoute のテストで確認する
vi.mock('./BlogPreviewRoute', () => ({ default: () => null }));

describe('/blog/preview/ のメタデータ', () => {
  it('検索エンジンに載せない(noindex, nofollow)', async () => {
    const { metadata } = await import('./page');

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('useSearchParams を使う BlogPreviewRoute を、Suspense で包む(静的書き出しの要件)', async () => {
    const { default: BlogPreviewPage } = await import('./page');

    const el = BlogPreviewPage();

    expect(isValidElement(el)).toBe(true);
    expect(el.props.fallback).toBeTruthy();
    expect(isValidElement(el.props.children)).toBe(true);
  });
});
