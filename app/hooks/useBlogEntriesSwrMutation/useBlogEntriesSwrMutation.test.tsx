// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useBlogEntriesSwrMutation from './useBlogEntriesSwrMutation';

const fetchMock = vi.fn();

const entryJson = {
  id: 1,
  code: 'a.html',
  sort: 1,
  csort: 1,
  usort: 1,
  status: 'open',
  title: '記事A',
  path: '/blog/a.html/',
  isNew: false,
  createdAt: '2026-01-02T03:04:05.000Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('useBlogEntriesSwrMutation', () => {
  it('初期状態では entries は空配列', () => {
    const { result } = renderHook(() => useBlogEntriesSwrMutation());
    expect(result.current.entries).toEqual([]);
    expect(result.current.isMutating).toBe(false);
  });

  it('trigger でキーワード検索し、entries を更新する(特殊文字は URL エンコードされる)', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [{ id: 1 }] }),
    });
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'あ&い' });
    });

    const url = new URL(fetchMock.mock.calls[0][0], 'https://example.com');
    expect(url.pathname).toBe('/api/blog/');
    expect(url.searchParams.get('keyword')).toBe('あ&い');
    await waitFor(() => expect(result.current.entries).toEqual([{ id: 1 }]));
  });

  it('記事の日付を Date にして返す', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ entries: [entryJson] }),
    });
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'a b' });
    });

    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    expect(result.current.entries[0].createdAt).toBeInstanceOf(Date);
  });

  it('レスポンスが ok でなければ error を返す', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({ ok: false, status: 502 });
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'a' }).catch(() => {});
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.entries).toEqual([]);
  });
});
