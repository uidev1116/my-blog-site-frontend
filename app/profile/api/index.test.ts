import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/app/lib/acms', () => ({ default: { get } }));

import { getProfileEntry } from './index';

const rawEntry = {
  eid: 1,
  ecd: 'profile',
  status: 'open',
  sort: 1,
  csort: 2,
  usort: 3,
  title: 'プロフィール',
  url: 'https://cms.example.com/profile/profile.html',
  isNew: false,
  datetime: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  createdAt: '2026-01-03T00:00:00Z',
  publishStartAt: '2026-01-04T00:00:00Z',
  publishEndAt: '2026-01-05T00:00:00Z',
  summary: '要約',
  body: [],
};

beforeEach(() => {
  get.mockReset();
});

describe('getProfileEntry', () => {
  it('プロフィールエントリーを変換する', async () => {
    get.mockResolvedValue({ data: { items: [rawEntry] } });
    expect(await getProfileEntry()).toMatchObject({
      id: 1,
      code: 'profile',
      path: '/profile/profile.html',
      summary: '要約',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
  });

  it('summary が無ければ空文字', async () => {
    get.mockResolvedValue({
      data: { items: [{ ...rawEntry, summary: undefined }] },
    });
    expect((await getProfileEntry())?.summary).toBe('');
  });

  it('エントリーが無ければ null', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getProfileEntry()).toBeNull();
  });

  it('404 は null として扱う', async () => {
    get.mockRejectedValue(new Error('fetch API response status: 404'));
    expect(await getProfileEntry()).toBeNull();
  });

  it('404 以外のエラーは再スローする', async () => {
    get.mockRejectedValue(new Error('fetch API response status: 500'));
    await expect(getProfileEntry()).rejects.toThrow('500');
  });
});
