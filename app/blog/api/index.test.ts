import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/app/lib/acms', () => ({ default: { get } }));
vi.mock('@/app/config/acms', () => ({ PREVIEW_KEY: 'secret' }));

import {
  getAllBlogEntries,
  getBlogEntries,
  getBlogEntry,
  getTagFilter,
  getTagRelationalEntries,
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
  isNew: false,
  datetime: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  createdAt: '2026-01-03T00:00:00Z',
  publishStartAt: '2026-01-04T00:00:00Z',
  publishEndAt: '2026-01-05T00:00:00Z',
  summary: '要約',
  tags: [{ name: 't', url: 'https://cms.example.com/blog/tag/t/' }],
  body: [{ type: 'text' }],
  blog: {
    bid: 2,
    code: 'blog',
    name: 'ブログ',
    url: 'https://cms.example.com/blog/',
    fields: { ogp_image_base: { value: { path: 'ogp/base.png' } } },
  },
};

beforeEach(() => {
  get.mockReset();
});

describe('getBlogEntries', () => {
  it('エントリーとページャーを変換する', async () => {
    get.mockResolvedValue({
      data: {
        items: [rawEntry],
        pagination: {
          firstPage: 1,
          lastPage: 3,
          prevPage: {
            url: 'https://cms.example.com/blog/keyword/foo/page/1/',
            count: 10,
            page: 1,
          },
          pages: [
            { page: 1, url: 'https://cms.example.com/blog/keyword/foo/' },
            { page: 2, url: 'https://cms.example.com/blog/page/2/' },
          ],
          nextPage: {
            url: 'https://cms.example.com/blog/page/3/',
            count: 5,
            page: 3,
          },
        },
      },
    });

    const res = await getBlogEntries({ page: 2 });

    expect(get.mock.calls[0][0]).toEqual({
      page: 2,
      blog: 'blog',
      api: 'summary_index',
    });
    expect(res.entries[0]).toMatchObject({
      id: 1,
      code: 'a',
      path: '/blog/a.html',
      tags: [{ name: 't', path: '/blog/tag/t/' }],
    });
    // keyword セグメントは取り除かれる
    expect(res.pager).toEqual({
      firstPage: 1,
      lastPage: 3,
      previous: { path: '/blog/page/1/', num: 10, page: 1 },
      pages: [
        { page: 1, path: '/blog/' },
        { page: 2, path: '/blog/page/2/' },
      ],
      next: { path: '/blog/page/3/', num: 5, page: 3 },
    });
  });

  it('前後のページが無ければ previous / next を含めない', async () => {
    get.mockResolvedValue({
      data: {
        items: [],
        pagination: {
          firstPage: 1,
          lastPage: 1,
          prevPage: null,
          nextPage: null,
        },
      },
    });

    const { pager } = await getBlogEntries();
    expect(pager).toEqual({ firstPage: 1, lastPage: 1, pages: [] });
  });

  it('pagination が無ければ pager を含めない', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getBlogEntries()).toEqual({ entries: [] });
  });

  it('summary / tags が無いエントリーは既定値で埋める', async () => {
    const { summary, tags, ...rest } = rawEntry;
    void summary;
    void tags;
    get.mockResolvedValue({ data: { items: [rest] } });
    const { entries } = await getBlogEntries();
    expect(entries[0].summary).toBe('');
    expect(entries[0].tags).toEqual([]);
  });
});

describe('getAllBlogEntries', () => {
  it('全記事を変換する', async () => {
    get.mockResolvedValue({ data: { items: [rawEntry] } });
    const entries = await getAllBlogEntries();
    expect(get.mock.calls[0][0]).toEqual({
      blog: 'blog',
      api: 'summary_blog_all',
    });
    expect(entries).toEqual([
      expect.objectContaining({ code: 'a', path: '/blog/a.html' }),
    ]);
  });

  it('items が無ければ空配列', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getAllBlogEntries()).toEqual([]);
  });
});

describe('getTagRelationalEntries', () => {
  const raw = {
    ...rawEntry,
    'date#': '2026-01-01',
    'udate#': '2026-01-02',
    'pdate#': '2026-01-03',
    'sdate#': '2026-01-04',
    'edate#': '2026-01-05',
  };

  it('関連記事を変換する', async () => {
    get.mockResolvedValue({ data: { 'entry:loop': [raw] } });
    const entries = await getTagRelationalEntries('a');
    expect(get.mock.calls[0][0]).toEqual({
      blog: 'blog',
      entry: 'a',
      api: 'tag_relational_index',
    });
    expect(entries[0]).toMatchObject({
      code: 'a',
      createdAt: new Date('2026-01-01'),
      endAt: new Date('2026-01-05'),
    });
  });

  it('プレビュー時は previewKey を付ける', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getTagRelationalEntries('a', true)).toEqual([]);
    const { searchParams } = get.mock.calls[0][0];
    expect(searchParams.get('previewKey')).toBe('secret');
  });

  it('summary が無ければ空文字', async () => {
    get.mockResolvedValue({
      data: { 'entry:loop': [{ ...raw, summary: undefined }] },
    });
    expect((await getTagRelationalEntries('a'))[0].summary).toBe('');
  });
});

describe('getBlogEntry', () => {
  it('記事詳細を変換する', async () => {
    get.mockResolvedValue({ data: { items: [rawEntry] } });
    const entry = await getBlogEntry('a');
    expect(get.mock.calls[0][0]).toEqual({
      blog: 'blog',
      entry: 'a',
      api: 'body_detail',
    });
    expect(entry).toMatchObject({
      code: 'a',
      body: [{ type: 'text' }],
      blog: {
        id: 2,
        code: 'blog',
        name: 'ブログ',
        path: '/blog/',
        ogpImageBasePath: 'ogp/base.png',
      },
    });
  });

  it('プレビュー時は previewKey を searchParams に渡す', async () => {
    get.mockResolvedValue({ data: {} });
    await getBlogEntry('a', true);
    expect(get.mock.calls[0][0].searchParams).toEqual({ previewKey: 'secret' });
  });

  it('記事が無ければ null', async () => {
    get.mockResolvedValue({ data: { items: [] } });
    expect(await getBlogEntry('a')).toBeNull();
  });

  it('コードが一致しなければ null', async () => {
    get.mockResolvedValue({ data: { items: [{ ...rawEntry, ecd: 'other' }] } });
    expect(await getBlogEntry('a')).toBeNull();
  });

  it('summary / tags が無ければ既定値で埋める', async () => {
    get.mockResolvedValue({
      data: { items: [{ ...rawEntry, summary: undefined, tags: undefined }] },
    });
    const entry = await getBlogEntry('a');
    expect(entry?.summary).toBe('');
    expect(entry?.tags).toEqual([]);
  });
});

describe('getTagFilter', () => {
  it('選択済みタグと選択可能タグを変換する', async () => {
    get.mockResolvedValue({
      data: {
        'selected:loop': [
          {
            name: 'a',
            path: '/tag/a/',
            omitUrl: 'https://cms.example.com/blog/tag/b/',
          },
        ],
        'choice:loop': [{ name: 'c', path: '/tag/a/c/' }],
      },
    });

    expect(await getTagFilter(['a'])).toEqual({
      selected: [{ name: 'a', path: '/tag/a/', omitPath: '/blog/tag/b/' }],
      selectable: [{ name: 'c', path: '/tag/a/c/' }],
    });
    expect(get.mock.calls[0][0]).toEqual({
      blog: 'blog',
      tag: ['a'],
      api: 'tag_filter',
    });
  });

  it('ループが無ければ空配列', async () => {
    get.mockResolvedValue({ data: {} });
    expect(await getTagFilter([])).toEqual({ selected: [], selectable: [] });
  });
});
