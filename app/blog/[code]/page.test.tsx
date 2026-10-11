import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getAllBlogEntries: vi.fn(),
  getTagRelationalEntries: vi.fn(),
  getBlogEntry: vi.fn(),
  getMetadata: vi.fn(),
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
vi.mock('next/navigation', () => ({ notFound: m.notFound }));
vi.mock('../routes/BlogDetailRoute', () => ({ default: () => null }));

import BlogDetailPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

const params = { params: Promise.resolve({ code: 'a' }) };

beforeEach(() => {
  vi.clearAllMocks();
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

  it('openGraph / twitter が無くても落ちない', async () => {
    m.getMetadata.mockResolvedValue({});
    const meta = await generateMetadata(params);
    expect(meta.openGraph).toBeUndefined();
  });

  it('静的書き出しでは、ビルド時に生成した記事だけを配信する', () => {
    expect(dynamicParams).toBe(false);
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
    // 下書きは、静的書き出しでは扱わない(プレビューは /blog/preview/)
    expect(m.getBlogEntry).toHaveBeenCalledWith('a');
    expect(m.getTagRelationalEntries).toHaveBeenCalledWith('a');
    expect(el.props).toEqual({
      entry: { code: 'a' },
      relationalEntries: [{ code: 'b' }],
    });
  });

  it('記事が無ければ notFound', async () => {
    m.getBlogEntry.mockResolvedValue(null);
    await expect(BlogDetailPage(params)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(m.getTagRelationalEntries).not.toHaveBeenCalled();
  });
});
