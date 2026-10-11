import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getProfileEntry: vi.fn(),
  getMetadata: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('./api', () => ({ getProfileEntry: m.getProfileEntry }));
vi.mock('../api', () => ({ getMetadata: m.getMetadata }));
vi.mock('next/navigation', () => ({ notFound: m.notFound }));
vi.mock('./routes/ProfileRoute', () => ({ default: () => null }));

import ProfilePage, { generateMetadata } from './page';

beforeEach(() => vi.clearAllMocks());

describe('/profile', () => {
  it('OGP の type を profile にする', async () => {
    m.getMetadata.mockResolvedValue({
      title: 't',
      openGraph: { title: 't', type: 'website' },
    });
    const meta = await generateMetadata();
    expect(m.getMetadata).toHaveBeenCalledWith({ category: 'profile' });
    expect(meta).toEqual({
      title: 't',
      openGraph: { title: 't', type: 'profile' },
    });
  });

  it('プロフィールを ProfileRoute に渡す', async () => {
    m.getProfileEntry.mockResolvedValue({ id: 1 });
    const el = await ProfilePage();
    expect(el.props).toEqual({ entry: { id: 1 } });
  });

  it('プロフィールが無ければ notFound', async () => {
    m.getProfileEntry.mockResolvedValue(null);
    await expect(ProfilePage()).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
