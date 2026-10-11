// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// app/config が、サイトの URL を import 時に読む
vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');

// 本文を取得して表示した後に、ビルトイン JS(目次・外部リンク・表のスクロールなど)を適用する
const buildIn = vi.hoisted(() => ({ applyBuildIn: vi.fn() }));
vi.mock('@/app/lib/buildIn', () => buildIn);

let query = 'code=draft.html';
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(query),
}));
// 記事の描画そのものは、このテストの対象外
vi.mock('../routes/BlogDetailRoute', () => ({
  default: ({
    entry,
    relationalEntries,
  }: {
    entry: { title: string; createdAt: Date };
    relationalEntries: { title: string }[];
  }) => (
    <article>
      <h1>{entry.title}</h1>
      <time>{entry.createdAt instanceof Date ? 'date-ok' : 'date-ng'}</time>
      <ul>
        {relationalEntries.map((e) => (
          <li key={e.title}>{e.title}</li>
        ))}
      </ul>
    </article>
  ),
}));

const entryJson = {
  id: 1,
  code: 'draft.html',
  title: '下書きの記事',
  path: '/blog/draft.html/',
  createdAt: '2026-01-02T03:04:05.000Z',
  body: '<p>本文</p>',
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
  const { default: BlogPreviewRoute } = await import('./BlogPreviewRoute');
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <BlogPreviewRoute />
    </SWRConfig>,
  );
}

describe('BlogPreviewRoute', () => {
  beforeEach(() => {
    query = 'code=draft.html';
    buildIn.applyBuildIn.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('URL の code で下書きを取得し、記事と関連記事を表示する(プレビュー表示中の案内つき)', async () => {
    const fn = respond({
      entry: entryJson,
      relationalEntries: [{ ...entryJson, id: 2, title: '関連記事' }],
    });

    await renderRoute();

    expect(
      await screen.findByRole('heading', { name: '下書きの記事' }),
    ).toBeTruthy();
    expect(screen.getByText('関連記事')).toBeTruthy();
    expect(screen.getByText('date-ok')).toBeTruthy();
    expect(screen.getByRole('note').textContent).toContain('プレビュー');
    const url = new URL(fn.mock.calls[0][0], 'https://example.com');
    expect(url.searchParams.get('code')).toBe('draft.html');
  });

  it('code が無ければ、API を呼ばずに案内を表示する', async () => {
    query = '';
    const fn = respond({});

    await renderRoute();

    expect(
      screen.getByText('プレビューする記事が指定されていません。'),
    ).toBeTruthy();
    expect(fn).not.toHaveBeenCalled();
  });

  it('取得中は、読み込み中であることを表示する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    await renderRoute();

    expect(screen.getByRole('status').textContent).toContain('読み込み中');
  });

  it('401 なら、有効期限切れの案内を表示し、再試行しない', async () => {
    const fn = respond({}, { ok: false, status: 401 });

    await renderRoute();

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('有効期限');
    });
    await new Promise((r) => setTimeout(r, 100));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('404 なら、記事が見つからないことを表示する', async () => {
    respond({}, { ok: false, status: 404 });

    await renderRoute();

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        '記事が見つかりません',
      );
    });
  });

  it('その他のエラーは、取得に失敗したことを表示する', async () => {
    respond({}, { ok: false, status: 502 });

    await renderRoute();

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        '取得に失敗しました',
      );
    });
  });

  it('本文を表示した後に、ビルトイン JS を適用する(目次は、本文が DOM に出てから作る必要がある)', async () => {
    respond({ entry: entryJson, relationalEntries: [] });

    await renderRoute();
    await screen.findByRole('heading', { name: '下書きの記事' });

    await waitFor(() => {
      expect(buildIn.applyBuildIn).toHaveBeenCalledWith(document);
    });
  });

  it('本文が表示されるまで(取得中・エラー)は、ビルトイン JS を適用しない', async () => {
    respond({}, { ok: false, status: 401 });

    await renderRoute();
    await screen.findByRole('alert');

    expect(buildIn.applyBuildIn).not.toHaveBeenCalled();
  });
});
