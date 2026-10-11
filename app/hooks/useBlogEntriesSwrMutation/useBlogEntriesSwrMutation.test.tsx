// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useBlogEntriesSwrMutation from './useBlogEntriesSwrMutation';

const fetchMock = vi.fn();

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

  it('trigger でキーワード検索し、entries を更新する', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [{ id: 1 }] }),
    });
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'あ&い' });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/blog?keyword=${encodeURIComponent('あ&い')}`,
    );
    await waitFor(() => expect(result.current.entries).toEqual([{ id: 1 }]));
  });

  it('レスポンスが ok でなければ error を返す', async () => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({ ok: false });
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'a' }).catch(() => {});
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.entries).toEqual([]);
  });
});
