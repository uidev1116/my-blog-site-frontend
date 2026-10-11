import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getBlogEntry, enable, redirect } = vi.hoisted(() => ({
  getBlogEntry: vi.fn(),
  enable: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock('@/app/config/acms', () => ({ PREVIEW_KEY: 'secret' }));
vi.mock('@/app/blog/api', () => ({ getBlogEntry }));
vi.mock('next/headers', () => ({ draftMode: async () => ({ enable }) }));
vi.mock('next/navigation', () => ({ redirect }));

import { GET } from './route';

const call = (query: string) =>
  GET(new Request(`https://example.com/api/blog/draft${query}`));

beforeEach(() => {
  getBlogEntry.mockReset();
  enable.mockReset();
  redirect.mockReset();
});

describe('GET /api/blog/draft', () => {
  it.each(['', '?previewKey=', '?code=a'])(
    'previewKey が無い/空なら 400 (%s)',
    async (query) => {
      expect((await call(query)).status).toBe(400);
    },
  );

  it.each(['?previewKey=secret', '?previewKey=secret&code='])(
    'code が無い/空なら 400 (%s)',
    async (query) => {
      expect((await call(query)).status).toBe(400);
    },
  );

  it('previewKey が違えば 401 で記事を取得しない', async () => {
    const res = await call('?previewKey=wrong&code=a');
    expect(res.status).toBe(401);
    expect(getBlogEntry).not.toHaveBeenCalled();
  });

  it('記事が無ければ 404', async () => {
    getBlogEntry.mockResolvedValue(null);
    const res = await call('?previewKey=secret&code=a');
    expect(res.status).toBe(404);
    expect(enable).not.toHaveBeenCalled();
  });

  it('下書きモードを有効にして記事へリダイレクトする', async () => {
    getBlogEntry.mockResolvedValue({ path: '/blog/a.html' });
    await call('?previewKey=secret&code=a');
    expect(getBlogEntry).toHaveBeenCalledWith('a', true);
    expect(enable).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/blog/a.html');
  });
});
