// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const copyMock = vi.fn();
vi.mock('copy-to-clipboard', () => ({ default: copyMock }));

describe('useClipboard', () => {
  beforeEach(() => {
    copyMock.mockReset();
  });

  it('コピーに成功すると copied が true になり onCopy が呼ばれる', async () => {
    // copy-to-clipboard v4 は Promise<boolean> を返す
    copyMock.mockResolvedValue(true);
    const onCopy = vi.fn();
    const { default: useClipboard } =
      await import('@/app/hooks/useClipboard/useClipboard');
    const { result } = renderHook(() => useClipboard({ onCopy }));

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(copyMock).toHaveBeenCalledWith('hello', {});
    expect(result.current.copied).toBe(true);
    expect(onCopy).toHaveBeenCalledWith('hello');
  });

  it('コピーに失敗すると copied は false のままで onCopy は呼ばれない', async () => {
    copyMock.mockResolvedValue(false);
    const onCopy = vi.fn();
    const { default: useClipboard } =
      await import('@/app/hooks/useClipboard/useClipboard');
    const { result } = renderHook(() => useClipboard({ onCopy }));

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copied).toBe(false);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('reset で copied が false に戻る', async () => {
    copyMock.mockResolvedValue(true);
    const { default: useClipboard } =
      await import('@/app/hooks/useClipboard/useClipboard');
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });
    expect(result.current.copied).toBe(true);

    act(() => result.current.reset());
    expect(result.current.copied).toBe(false);
  });
});
