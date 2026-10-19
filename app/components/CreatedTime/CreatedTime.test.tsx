// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CreatedTime from './CreatedTime';

// a-blog cms の日時はタイムゾーンなしの日本時間。テストは実行環境のタイムゾーンに依存させない
const NOW = new Date('2026-06-15T12:00:00+09:00');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// NOW から ms 前の、日本時間の日時文字列(yyyy-MM-dd HH:mm:ss)
const ago = (ms: number) =>
  new Date(NOW.getTime() - ms + 9 * HOUR)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

describe('CreatedTime', () => {
  it.each([
    ['30 秒前', 30 * SEC, '30秒前'],
    ['5 分前', 5 * MIN, '5分前'],
    ['3 時間前', 3 * HOUR, '3時間前'],
    ['2 日前', 2 * DAY, '2日前'],
    ['2 週間前', 14 * DAY, '2週間前'],
    ['4 週間 (1 ヶ月未満)', 28 * DAY, '1ヶ月前'],
    ['3 ヶ月前', 95 * DAY, '3ヶ月前'],
  ])('%s', (_label, ms, expected) => {
    render(<CreatedTime createdAt={ago(ms)} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('半年以上前は絶対日時 (yyyy/MM/dd) で表示する', () => {
    render(<CreatedTime createdAt="2025-01-02 03:04:05" />);
    expect(screen.getByText('2025/01/02')).toBeInTheDocument();
  });

  it('dateTime 属性に ISO9075 形式を設定し、className を渡す', () => {
    render(<CreatedTime createdAt="2026-06-15 11:00:00" className="c" />);
    const el = screen.getByText('1時間前');
    expect(el.tagName).toBe('TIME');
    expect(el).toHaveAttribute('datetime', '2026-06-15 11:00:00');
    expect(el).toHaveClass('c');
  });

  it('日時は日本時間として読む(実行環境のタイムゾーンで、時間差がずれない)', () => {
    // 日本時間 11:00 は、UTC の 02:00。NOW(日本時間 12:00)の 1 時間前
    render(<CreatedTime createdAt="2026-06-15 11:00:00" />);
    expect(screen.getByText('1時間前')).toBeInTheDocument();
  });

  it('未来の日時でも、マイナスにせず 0 秒前と表示する', () => {
    render(<CreatedTime createdAt="2026-06-15 21:00:00" />);
    expect(screen.getByText('0秒前')).toBeInTheDocument();
    expect(screen.queryByText(/-/)).toBeNull();
  });

  it('サーバーの描画(ビルド時)では、時刻に依存しない絶対日付を出す', () => {
    // 相対表示はブラウザで表示したあとに計算する(ビルド時の時刻が HTML に焼き込まれないように)
    const html = renderToStaticMarkup(
      <CreatedTime createdAt="2026-06-15 11:00:00" />,
    );
    expect(html).toContain('2026/06/15');
    expect(html).not.toContain('前');
  });
  it('開いたままでも、1 分ごとに表示を更新する', () => {
    render(<CreatedTime createdAt={ago(30 * SEC)} />);
    expect(screen.getByText('30秒前')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60 * SEC);
    });

    expect(screen.getByText('1分前')).toBeInTheDocument();
  });

  it('画面から消えたら更新をやめる(タイマーが残らない)', () => {
    const { unmount } = render(<CreatedTime createdAt={ago(30 * SEC)} />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
