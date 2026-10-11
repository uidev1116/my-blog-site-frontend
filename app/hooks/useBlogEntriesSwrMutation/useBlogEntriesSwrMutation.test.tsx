// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useBlogEntriesSwrMutation from './useBlogEntriesSwrMutation';

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

describe('useBlogEntriesSwrMutation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keyword で /api/blog/ を呼び、記事の日付を Date にして返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ entries: [entryJson] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'a b' });
    });

    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    const url = new URL(fetchMock.mock.calls[0][0], 'https://example.com');
    expect(url.pathname).toBe('/api/blog/');
    expect(url.searchParams.get('keyword')).toBe('a b');
    expect(result.current.entries[0].createdAt).toBeInstanceOf(Date);
  });

  it('API が失敗したら error を返す', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }),
    );
    const { result } = renderHook(() => useBlogEntriesSwrMutation());

    await act(async () => {
      await result.current.trigger({ keyword: 'cms' }).catch(() => {});
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
  });
});
