import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getAllBlogEntries: vi.fn(),
  getTagRelationalEntries: vi.fn(),
  getBlogEntry: vi.fn(),
  getMetadata: vi.fn(),
  draft: { isEnabled: false },
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('../api', () => ({
  getAllBlogEntries: m.getAllBlogEntries,
  getTagRelationalEntries: m.getTagRelationalEntries,
  getBlogEntry: m.getBlogEntry,
}));
vi.mock('@/app/api', () => ({ getMetadata: m.getMetadata }));
vi.mock('next/headers', () => ({ draftMode: async () => m.draft }));
vi.mock('next/navigation', () => ({ notFound: m.notFound }));
vi.mock('@/app/config/acms', () => ({ PREVIEW_KEY: 'secret' }));
vi.mock('../routes/BlogDetailRoute', () => ({ default: () => null }));

import BlogDetailPage, { generateMetadata, generateStaticParams } from './page';

const params = { params: Promise.resolve({ code: 'a' }) };

beforeEach(() => {
  vi.clearAllMocks();
  m.draft.isEnabled = false;
});

describe('/blog/[code]', () => {
  it('メタデータから OGP 画像を除き、canonical を付ける', async () => {
    m.getMetadata.mockResolvedValue({
      title: 't',
      openGraph: { title: 't', images: [{ url: 'x' }] },
      twitter: { title: 't', images: ['x'] },
    });

    const meta = await generateMetadata(params);

    expect(m.getMetadata).toHaveBeenCalledWith({ blog: 'blog', entry: 'a' });
    expect(meta.openGraph).not.toHaveProperty('images');
    expect(meta.twitter).not.toHaveProperty('images');
    expect(meta.alternates?.canonical).toBe('/blog/a/');
    expect(meta.title).toBe('t');
  });

  it('下書きモードでは previewKey を付けて取得する', async () => {
    m.draft.isEnabled = true;
    m.getMetadata.mockResolvedValue({});
    await generateMetadata(params);
    const arg = m.getMetadata.mock.calls[0][0];
    expect(arg.searchParams.get('previewKey')).toBe('secret');
  });

  it('openGraph / twitter が無くても落ちない', async () => {
    m.getMetadata.mockResolvedValue({});
    const meta = await generateMetadata(params);
    expect(meta.openGraph).toBeUndefined();
  });

  it('静的パラメータは全記事のコード', async () => {
    m.getAllBlogEntries.mockResolvedValue([{ code: 'a' }, { code: 'b' }]);
    expect(await generateStaticParams()).toEqual([
      { code: 'a' },
      { code: 'b' },
    ]);
  });

  it('記事と関連記事を BlogDetailRoute に渡す', async () => {
    m.getBlogEntry.mockResolvedValue({ code: 'a' });
    m.getTagRelationalEntries.mockResolvedValue([{ code: 'b' }]);
    const el = await BlogDetailPage(params);
    expect(m.getBlogEntry).toHaveBeenCalledWith('a', false);
    expect(m.getTagRelationalEntries).toHaveBeenCalledWith('a');
    expect(el.props).toEqual({
      entry: { code: 'a' },
      relationalEntries: [{ code: 'b' }],
    });
  });

  it('下書きモードでは preview として記事を取得する', async () => {
    m.draft.isEnabled = true;
    m.getBlogEntry.mockResolvedValue({ code: 'a' });
    m.getTagRelationalEntries.mockResolvedValue([]);
    await BlogDetailPage(params);
    expect(m.getBlogEntry).toHaveBeenCalledWith('a', true);
  });

  it('記事が無ければ notFound', async () => {
    m.getBlogEntry.mockResolvedValue(null);
    await expect(BlogDetailPage(params)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(m.getTagRelationalEntries).not.toHaveBeenCalled();
  });
});
