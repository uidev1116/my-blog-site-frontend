// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CreatedTime from './CreatedTime';

const NOW = new Date(2026, 5, 15, 12, 0, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

const ago = (ms: number) => {
  const d = new Date(NOW.getTime() - ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

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
});
