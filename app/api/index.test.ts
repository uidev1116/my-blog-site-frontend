import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
  vi.stubEnv('ACMS_ASSETS_PROTOCOL', 'https');
  vi.stubEnv('ACMS_ASSETS_HOSTNAME', 'assets.example.com');
  vi.stubEnv('ACMS_ASSETS_PORT', '');
});

const { get, isAcmsFetchError } = vi.hoisted(() => ({
  get: vi.fn(),
  isAcmsFetchError: vi.fn(),
}));
vi.mock('../lib/acms', () => ({ default: { get } }));
vi.mock('@uidev1116/acms-js-sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@uidev1116/acms-js-sdk')>()),
  isAcmsFetchError,
}));

import {
  getBlogEntries,
  getBlogNoIndex,
  getFooterNavigation,
  getGlobalNavigation,
  getMetadata,
  getOgp,
  getRootBlog,
  getSitemap,
} from './index';

const rawEntry = {
  eid: 1,
  ecd: 'a',
  sort: 1,
  csort: 2,
  usort: 3,
  status: 'open',
  title: 'タイトル',
  url: 'https://cms.example.com/blog/a.html',
  isNew: true,
  datetime: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  createdAt: '2026-01-03T00:00:00Z',
  publishStartAt: '2026-01-04T00:00:00Z',
  publishEndAt: '2026-01-05T00:00:00Z',
  summary: '要約',
  tags: [{ name: 'tag1', url: 'https://cms.example.com/blog/tag/tag1/' }],
};

beforeEach(() => {
  get.mockReset();
  isAcmsFetchError.mockReset();
  vi.restoreAllMocks();
});

describe('getBlogEntries', () => {
  it('API のレスポンスを Entry に変換する', async () => {
    get.mockResolvedValue({
      data: {
        indexUrl: 'https://cms.example.com/blog/',
        indexBlogName: 'ブログ',
        items: [rawEntry],
      },
    });

    const res = await getBlogEntries();

    expect(get.mock.calls[0][0]).toEqual({ api: 'summary_top_index' });
    expect(res.indexPath).toBe('/blog/');
    expect(res.indexBlogName).toBe('ブログ');
    expect(res.entries).toEqual([
      {
        id: 1,
        code: 'a',
        sort: 1,
        csort: 2,
        usort: 3,
        status: 'open',
        title: 'タイトル',
        path: '/blog/a.html',
        isNew: true,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-02T00:00:00Z'),
        postedAt: new Date('2026-01-03T00:00:00Z'),
        startAt: new Date('2026-01-04T00:00:00Z'),
        endAt: new Date('2026-01-05T00:00:00Z'),
        summary: '要約',
        tags: [{ name: 'tag1', path: '/blog/tag/tag1/' }],
      },
    ]);
  });

  it('summary と tags が無くても既定値で埋める', async () => {
    const { summary, tags, ...rest } = rawEntry;
    void summary;
    void tags;
    get.mockResolvedValue({
      data: {
        indexUrl: 'https://cms.example.com/blog/',
        indexBlogName: 'ブログ',
        items: [rest],
      },
    });

    const { entries } = await getBlogEntries();
    expect(entries[0].summary).toBe('');
    expect(entries[0].tags).toEqual([]);
  });

  it('items が無ければ空配列', async () => {
    get.mockResolvedValue({
      data: { indexUrl: 'https://cms.example.com/blog/', indexBlogName: 'b' },
    });
    expect((await getBlogEntries()).entries).toEqual([]);
  });

  it('ACMS のエラー時は空の結果を返し、レスポンスをログに出す', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = { response: { data: 'x' } };
    get.mockRejectedValue(error);
    isAcmsFetchError.mockReturnValue(true);

    expect(await getBlogEntries()).toEqual({
      indexPath: '',
      indexBlogName: '',
      entries: [],
    });
    expect(spy).toHaveBeenCalledWith('error.response.data', 'x');
  });

  it('その他のエラー時も空の結果を返す', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    get.mockRejectedValue(new Error('boom'));
    isAcmsFetchError.mockReturnValue(false);

    expect(await getBlogEntries()).toEqual({
      indexPath: '',
      indexBlogName: '',
      entries: [],
    });
    expect(spy).toHaveBeenCalled();
  });
});

describe.each([
  ['getGlobalNavigation', getGlobalNavigation, 'navigation_global'],
  ['getFooterNavigation', getFooterNavigation, 'navigation_footer'],
])('%s', (_name, fn, api) => {
  it('リンクを持つナビゲーションだけを変換する', async () => {
    get.mockResolvedValue({
      data: {
        'navigation:loop': [
          {
            label: 'ホーム',
            level: '1',
            'link#front': { url: '/', target: '' },
          },
          { label: 'リンク無し', level: '1' },
          [{ label: '配列' }],
          {
            label: '外部',
            level: '2',
            'link#front': { url: 'https://x.com', target: '_blank' },
          },
        ],
      },
    });

    expect(await fn()).toEqual([
      { label: 'ホーム', level: 1, url: '/', target: '' },
      { label: '外部', level: 2, url: 'https://x.com', target: '_blank' },
    ]);
    expect(get.mock.calls[0][0]).toEqual({ api });
  });

  it('navigation:loop が無ければ空配列', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await fn()).toEqual([]);
  });
});

describe('getRootBlog', () => {
  it('ブログ設定を変換する', async () => {
    get.mockResolvedValue({
      data: {
        id: 1,
        code: 'root',
        name: 'サイト',
        twitter_account: 'tw',
        google_site_verification: 'gsv',
        ga_tracking_id: 'G-1',
        script_head: '<script>h()</script>',
        script_body_start: '<script>s()</script>',
        script_body_end: '<script>e()</script>',
        blog_meta_robots: ['noindex'],
      },
    });

    expect(await getRootBlog()).toEqual({
      id: 1,
      code: 'root',
      name: 'サイト',
      path: '/',
      twitterAccount: 'tw',
      googleSiteVerification: 'gsv',
      gaId: 'G-1',
      scriptHead: '<script>h()</script>',
      scriptBodyStart: '<script>s()</script>',
      scriptBodyEnd: '<script>e()</script>',
      noIndex: true,
    });
  });

  it('code・gaId・script は未設定なら空文字、noIndex は false', async () => {
    get.mockResolvedValue({ data: { id: 1, name: 'サイト' } });
    const blog = await getRootBlog();
    expect(blog.code).toBe('');
    expect(blog.gaId).toBe('');
    expect(blog.scriptHead).toBe('');
    expect(blog.scriptBodyStart).toBe('');
    expect(blog.scriptBodyEnd).toBe('');
    expect(blog.noIndex).toBe(false);
  });

  it.each([
    ['配列', ['noindex'], true],
    ['文字列', 'noindex', true],
    ['空配列', [], false],
    ['空文字', '', false],
  ])('blog_meta_robots が %s のときの noIndex', async (_l, value, expected) => {
    get.mockResolvedValue({ data: { id: 1, blog_meta_robots: value } });
    expect((await getRootBlog()).noIndex).toBe(expected);
  });
});

describe('getBlogNoIndex', () => {
  it('指定したブログの blog_meta_robots を見る', async () => {
    get.mockResolvedValue({ data: { blog_meta_robots: ['noindex'] } });
    expect(await getBlogNoIndex('blog')).toBe(true);
    expect(get.mock.calls[0][0]).toEqual({ blog: 'blog', api: 'BF_ctx' });
  });

  it('未設定なら false', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getBlogNoIndex('blog')).toBe(false);
  });
});

describe('getOgp', () => {
  it('画像があれば image を含める', async () => {
    get.mockResolvedValue({
      data: {
        title: 't',
        description: 'd',
        keywords: 'k',
        image: 'a.png',
        'image@x': 100,
        'image@y': 50,
      },
    });

    expect(await getOgp({ blog: 'blog' })).toEqual({
      title: 't',
      description: 'd',
      keywords: 'k',
      image: { path: 'a.png', width: 100, height: 50 },
    });
    expect(get.mock.calls[0][0]).toEqual({ blog: 'blog', api: 'ogp' });
  });

  it('画像が無ければ image を含めず、欠損値は空文字になる', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getOgp()).toEqual({
      title: '',
      description: '',
      keywords: '',
    });
  });
});

describe('getMetadata', () => {
  const mockApis = (
    ogp: Record<string, unknown> = {},
    blog: Record<string, unknown> = {},
  ) => {
    get.mockImplementation(async ({ api }: { api: string }) => {
      if (api === 'ogp') {
        return {
          data: { title: 'タイトル', description: '説明\n改行', ...ogp },
        };
      }
      return {
        data: { id: 1, name: 'サイト', twitter_account: 'tw', ...blog },
      };
    });
  };

  it('OGP とルートブログからメタデータを組み立てる', async () => {
    mockApis(
      { image: 'a.png', 'image@x': 10, 'image@y': 20 },
      {
        google_site_verification: 'gsv',
      },
    );

    const meta = await getMetadata({ blog: 'blog', entry: 'a' });

    expect(meta.metadataBase).toEqual(new URL('https://example.com'));
    expect(meta.title).toBe('タイトル');
    expect(meta.description).toBe('説明改行');
    expect(meta.openGraph).toMatchObject({
      siteName: 'サイト',
      type: 'article',
      locale: 'ja_JP',
      images: [
        {
          url: 'https://assets.example.com/media/a.png',
          width: 10,
          height: 20,
        },
      ],
    });
    expect(meta.twitter).toMatchObject({
      creator: '@tw',
      image: 'https://assets.example.com/media/a.png',
    });
    expect(meta.verification).toEqual({ google: 'gsv' });
    expect(meta.robots).toEqual({});
  });

  it('エントリーが無ければ website、画像・verification は含めない', async () => {
    mockApis();

    const meta = await getMetadata();

    expect(meta.openGraph).toMatchObject({ type: 'website', url: '/' });
    expect(meta.openGraph).not.toHaveProperty('images');
    expect(meta.twitter).not.toHaveProperty('image');
  });

  it('twitter_account が未設定なら creator を出さない(@undefined にしない)', async () => {
    mockApis({}, { twitter_account: undefined });
    const meta = await getMetadata();
    expect(meta.twitter).not.toHaveProperty('creator');
    expect(meta).not.toHaveProperty('verification');
    expect(meta.keywords).toBeUndefined();
  });

  it.each([
    ['page', { page: 2 }],
    ['tag', { tag: ['x'] }],
    ['keyword 検索', { searchParams: { keyword: 'a' } }],
  ])('%s の一覧は noindex', async (_label, ctx) => {
    mockApis();
    const meta = await getMetadata(ctx);
    expect(meta.robots).toEqual({ index: false });
  });

  it('ルートブログが noindex ならトップは noindex', async () => {
    mockApis({}, { blog_meta_robots: ['noindex'] });
    const meta = await getMetadata();
    expect(meta.robots).toEqual({ index: false });
  });

  it('対象のブログが noindex なら、そのブログ配下は noindex(ルートの設定は見ない)', async () => {
    get.mockImplementation(
      async ({ api, blog }: { api: string; blog?: string | number }) => {
        if (api === 'ogp') return { data: { title: 't', description: 'd' } };
        return {
          data: {
            id: 1,
            name: 'サイト',
            blog_meta_robots: blog === 'blog' ? ['noindex'] : [],
          },
        };
      },
    );
    expect((await getMetadata({ blog: 'blog' })).robots).toEqual({
      index: false,
    });
    expect((await getMetadata()).robots).toEqual({});
  });

  it('keyword 以外の searchParams は noindex にしない', async () => {
    mockApis();
    const meta = await getMetadata({ searchParams: { foo: 'bar' } });
    expect(meta.robots).toEqual({});
  });
});

describe('getSitemap', () => {
  it('URL を BASE_URL 基準に付け替える', async () => {
    get.mockResolvedValue({
      data: {
        'url:loop': [
          { loc: 'https://cms.example.com/blog/a.html', lastmod: '2026-01-01' },
        ],
      },
    });

    expect(await getSitemap()).toEqual([
      { url: 'https://example.com/blog/a.html', lastModified: '2026-01-01' },
    ]);
  });

  it('url:loop が無ければ空配列', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getSitemap()).toEqual([]);
  });
});
