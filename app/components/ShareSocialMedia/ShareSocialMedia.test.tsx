// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const copyMock = vi.hoisted(() => vi.fn());
vi.mock('copy-to-clipboard', () => ({ default: copyMock }));

import ShareSocialMedia from './ShareSocialMedia';

beforeEach(() => {
  copyMock.mockReset();
  copyMock.mockResolvedValue(true);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('ShareSocialMedia', () => {
  it('X と Facebook の共有リンクを新しいタブで開く形で描画する', () => {
    render(
      <ShareSocialMedia
        title="記事 & タイトル"
        url="https://example.com/a?x=1"
      />,
    );

    const [x, facebook] = screen.getAllByRole('link');
    const xUrl = new URL(x.getAttribute('href')!);
    expect(xUrl.origin + xUrl.pathname).toBe(
      'https://twitter.com/intent/tweet',
    );
    expect(xUrl.searchParams.get('text')).toBe('記事 & タイトル');
    expect(xUrl.searchParams.get('url')).toBe('https://example.com/a?x=1');

    const fbUrl = new URL(facebook.getAttribute('href')!);
    expect(fbUrl.origin + fbUrl.pathname).toBe(
      'https://www.facebook.com/sharer/sharer.php',
    );
    expect(fbUrl.searchParams.get('u')).toBe('https://example.com/a?x=1');

    for (const link of [x, facebook]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('URL コピー後に 2 秒間だけ「URL copied!」を表示する', async () => {
    vi.useFakeTimers();
    render(<ShareSocialMedia title="t" url="https://example.com/a" />);
    expect(
      screen.getByRole('button', { name: /Copy URL/ }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(copyMock.mock.calls[0][0]).toBe('https://example.com/a');
    expect(
      screen.getByRole('button', { name: /URL copied!/ }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole('button', { name: /Copy URL/ }),
    ).toBeInTheDocument();
  });
});
