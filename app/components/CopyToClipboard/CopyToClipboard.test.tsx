// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const copyMock = vi.hoisted(() => vi.fn());
vi.mock('copy-to-clipboard', () => ({ default: copyMock }));

import CopyToClipboard from './CopyToClipboard';

beforeEach(() => {
  copyMock.mockReset();
  copyMock.mockResolvedValue(true);
});

describe('CopyToClipboard', () => {
  it('子要素のクリックでテキストをコピーし、onCopy を呼ぶ', async () => {
    const onCopy = vi.fn();
    render(
      <CopyToClipboard text="コピーする文字" onCopy={onCopy}>
        <button type="button">コピー</button>
      </CopyToClipboard>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'コピー' }));

    await waitFor(() => expect(onCopy).toHaveBeenCalledWith('コピーする文字'));
    expect(copyMock.mock.calls[0][0]).toBe('コピーする文字');
  });

  it('子要素が元々持つ onClick も呼ぶ', () => {
    const onClick = vi.fn();
    render(
      <CopyToClipboard text="t">
        <button type="button" onClick={onClick}>
          コピー
        </button>
      </CopyToClipboard>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(copyMock).toHaveBeenCalled();
  });
});
