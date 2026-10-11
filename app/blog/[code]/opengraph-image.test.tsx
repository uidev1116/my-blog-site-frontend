import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getBlogEntry: vi.fn(),
  loadFont: vi.fn(),
  ImageResponse: vi.fn(),
}));
vi.mock('../api', () => ({ getBlogEntry: m.getBlogEntry }));
vi.mock('@/app/lib/font/google', () => ({ loadFont: m.loadFont }));
vi.mock('next/og', () => ({ ImageResponse: m.ImageResponse }));

import Image, { alt, contentType, size } from './opengraph-image';

const params = { params: Promise.resolve({ code: 'a' }) };

beforeEach(() => vi.clearAllMocks());

describe('opengraph-image', () => {
  it('メタ情報', () => {
    expect(alt).toBe('記事のOGP画像');
    expect(contentType).toBe('image/png');
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it('記事が無ければ 404', async () => {
    m.getBlogEntry.mockResolvedValue(null);
    const res = (await Image(params)) as Response;
    expect(res.status).toBe(404);
    expect(m.ImageResponse).not.toHaveBeenCalled();
  });

  it('記事タイトルの文字だけをフォントとして読み込み、画像を生成する', async () => {
    const font = new ArrayBuffer(1);
    m.getBlogEntry.mockResolvedValue({
      title: 'タイトル',
      blog: { ogpImageBasePath: '/ogp.png?x=1' },
    });
    m.loadFont.mockResolvedValue(font);

    await Image(params);

    expect(m.loadFont).toHaveBeenCalledWith({
      family: 'Noto Sans JP',
      weight: 700,
      text: 'タイトル',
    });
    const [element, options] = m.ImageResponse.mock.calls[0];
    expect(element.props.style.backgroundImage).toBe(
      'url("/ogp.png?x=1&type=original")',
    );
    expect(element.props.children.props.children).toBe('タイトル');
    expect(options).toMatchObject({ width: 1200, height: 630 });
    expect(options.fonts[0]).toMatchObject({
      name: 'NotoSansJP',
      data: font,
      weight: 700,
    });
  });
});
