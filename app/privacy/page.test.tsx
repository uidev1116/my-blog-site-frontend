import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getPrivacyEntry: vi.fn(),
  getMetadata: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('./api', () => ({ getPrivacyEntry: m.getPrivacyEntry }));
vi.mock('../api', () => ({ getMetadata: m.getMetadata }));
vi.mock('next/navigation', () => ({ notFound: m.notFound }));
vi.mock('./routes/PrivacyRoute', () => ({ default: () => null }));

import PrivacyPage, { generateMetadata } from './page';

beforeEach(() => vi.clearAllMocks());

describe('/privacy', () => {
  it('カテゴリ privacy のメタデータを使う', async () => {
    m.getMetadata.mockResolvedValue({
      title: 't',
      openGraph: { title: 't', type: 'website' },
    });
    const meta = await generateMetadata();
    expect(m.getMetadata).toHaveBeenCalledWith({ category: 'privacy' });
    expect(meta).toEqual({
      title: 't',
      openGraph: { title: 't', type: 'website' },
    });
  });

  it('プライバシーポリシーを PrivacyRoute に渡す', async () => {
    m.getPrivacyEntry.mockResolvedValue({ id: 1 });
    const el = await PrivacyPage();
    expect(el.props).toEqual({ entry: { id: 1 } });
  });

  it('エントリーが無ければ notFound', async () => {
    m.getPrivacyEntry.mockResolvedValue(null);
    await expect(PrivacyPage()).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
