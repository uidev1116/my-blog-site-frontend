// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// app/config が、サイトの URL を import 時に読む
vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');

let query = 'keyword=cms&page=2';
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(query),
  usePathname: () => '/blog/search/',
}));
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));
vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

const entryJson = {
  id: 1,
  code: 'a.html',
  sort: 1,
  csort: 1,
  usort: 1,
  status: 'open',
  title: '検索でヒットした記事',
  path: '/blog/a.html/',
  isNew: false,
  createdAt: '2026-01-02T03:04:05.000Z',
  summary: '概要',
  tags: [],
};

function respond(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fn = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

async function renderRoute() {
  const { default: BlogSearchRoute } = await import('./BlogSearchRoute');
  return render(
    // テストごとに SWR のキャッシュを分ける
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        errorRetryInterval: 5,
      }}
    >
      <BlogSearchRoute />
    </SWRConfig>,
  );
}

describe('BlogSearchRoute', () => {
  beforeEach(() => {
    query = 'keyword=cms&page=2';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('URL の keyword と page で API を呼び、結果の記事を表示する', async () => {
    const fn = respond({
      entries: [entryJson],
      pager: {
        firstPage: 1,
        lastPage: 3,
        pages: [
          { page: 1, path: '/blog/' },
          { page: 2, path: '/blog/page/2/' },
        ],
        next: { path: '/blog/page/3/', num: 10, page: 3 },
      },
    });

    await renderRoute();

    expect(await screen.findByText('検索でヒットした記事')).toBeTruthy();
    const url = new URL(fn.mock.calls[0][0], 'https://example.com');
    expect(url.searchParams.get('keyword')).toBe('cms');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('ページネーションは検索ページの URL を指す', async () => {
    respond({
      entries: [entryJson],
      pager: {
        firstPage: 1,
        lastPage: 3,
        pages: [
          { page: 1, path: '/blog/' },
          { page: 2, path: '/blog/page/2/' },
          { page: 3, path: '/blog/page/3/' },
        ],
      },
    });

    await renderRoute();

    const link = await screen.findByRole('link', { name: '3' });
    expect(link.getAttribute('href')).toBe('/blog/search/?keyword=cms&page=3');
  });

  it('page が無い URL は、1 ページ目として取得する(page=1 と同じキャッシュキー)', async () => {
    query = 'keyword=cms';
    const fn = respond({ entries: [entryJson] });

    await renderRoute();

    await screen.findByText('検索でヒットした記事');
    const url = new URL(fn.mock.calls[0][0], 'https://example.com');
    expect(url.searchParams.get('page')).toBe('1');
  });

  it.each(['0', 'abc', '-1', '1.5'])(
    '不正な page(%s)は、1 ページ目として扱う',
    async (page) => {
      query = `keyword=cms&page=${page}`;
      const fn = respond({ entries: [entryJson] });

      await renderRoute();

      await screen.findByText('検索でヒットした記事');
      const url = new URL(fn.mock.calls[0][0], 'https://example.com');
      expect(url.searchParams.get('page')).toBe('1');
    },
  );

  it('keyword が空なら、API を呼ばずにキーワードの入力を促す', async () => {
    query = 'keyword=';
    const fn = respond({ entries: [entryJson] });

    await renderRoute();

    expect(screen.getByText('キーワードを入力してください。')).toBeTruthy();
    expect(fn).not.toHaveBeenCalled();
  });

  it('keyword のパラメーターが無くても、API を呼ばない', async () => {
    query = '';
    const fn = respond({ entries: [entryJson] });

    await renderRoute();

    expect(fn).not.toHaveBeenCalled();
  });

  it('4xx(入力が不正)では再試行しない', async () => {
    const fn = respond({}, { ok: false, status: 400 });

    await renderRoute();

    await screen.findByRole('alert');
    await new Promise((r) => setTimeout(r, 150));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('5xx は再試行する', async () => {
    const fn = respond({}, { ok: false, status: 502 });

    await renderRoute();

    await screen.findByRole('alert');
    await waitFor(() => expect(fn.mock.calls.length).toBeGreaterThan(1));
  });

  it('結果が 0 件なら、見つからなかったことを表示する', async () => {
    respond({ entries: [] });

    await renderRoute();

    expect(
      await screen.findByText('お探しの記事が見つかりませんでした。'),
    ).toBeTruthy();
  });

  it('API が失敗したら、エラーメッセージを表示する', async () => {
    respond({}, { ok: false, status: 502 });

    await renderRoute();

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        '検索に失敗しました',
      );
    });
  });

  it('取得中は、検索中であることを表示する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    await renderRoute();

    expect(screen.getByRole('status').textContent).toContain('検索中');
  });
});
