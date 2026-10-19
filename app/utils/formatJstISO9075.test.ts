import { describe, expect, it } from 'vitest';
import formatJstISO9075 from './formatJstISO9075';

describe('formatJstISO9075', () => {
  it('実際の時刻(UTC)を、日本時間の yyyy-MM-dd HH:mm:ss にする', () => {
    expect(formatJstISO9075(new Date('2026-10-19T14:42:35Z'))).toBe(
      '2026-10-19 23:42:35',
    );
  });

  it('日付をまたぐ場合は、日本時間の日付にする', () => {
    expect(formatJstISO9075(new Date('2026-12-31T15:00:00Z'))).toBe(
      '2027-01-01 00:00:00',
    );
  });

  it('+09:00 で指定した時刻は、そのままの時刻になる', () => {
    expect(formatJstISO9075(new Date('2026-06-15T12:00:00+09:00'))).toBe(
      '2026-06-15 12:00:00',
    );
  });
});
