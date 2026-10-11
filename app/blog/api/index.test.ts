import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('@/app/lib/acms', () => ({ default: { get } }));

const item = {
  eid: 1,
  ecd: 'a.html',
  title: '記事A',
  url: 'https://backend.example.com/blog/a.html/',
  datetime: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
  createdAt: '2026-01-01 00:00:00',
  publishStartAt: '2026-01-01 00:00:00',
  publishEndAt: '9999-12-31 23:59:59',
  tags: [],
};

// a-blog cms の API は、ページ番号を数値ではなく { page, url, ... } のオブジェクトで返す
const pageRef = (page: number) => ({
  page,
  url: `https://backend.example.com/blog/page/${page}/`,
  current: false,
});

describe('getBlogEntries の pager', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('firstPage が null、lastPage がオブジェクトのレスポンスから、ページ番号を数値で取り出す', async () => {
    get.mockResolvedValue({
      data: {
        items: [item],
        pagination: {
          firstPage: null,
          lastPage: pageRef(8),
          prevPage: null,
          nextPage: { ...pageRef(2), count: 10 },
          pages: [pageRef(1), pageRef(2)],
        },
      },
    });
    const { getBlogEntries } = await import('./index');

    const { pager } = await getBlogEntries();

    expect(pager?.firstPage).toBe(1);
    expect(pager?.lastPage).toBe(8);
    expect(pager?.next).toEqual({ path: '/blog/page/2/', num: 10, page: 2 });
    expect(pager?.pages).toEqual([
      { page: 1, path: '/blog/page/1/' },
      { page: 2, path: '/blog/page/2/' },
    ]);
  });

  it('従来どおり数値で返ってきた場合も扱える', async () => {
    get.mockResolvedValue({
      data: {
        items: [item],
        pagination: {
          firstPage: 1,
          lastPage: 3,
          prevPage: null,
          nextPage: null,
          pages: [],
        },
      },
    });
    const { getBlogEntries } = await import('./index');

    const { pager } = await getBlogEntries();

    expect(pager?.firstPage).toBe(1);
    expect(pager?.lastPage).toBe(3);
  });

  it('lastPage が無い(1ページだけ)場合は、firstPage / lastPage を 1 にする', async () => {
    get.mockResolvedValue({
      data: {
        items: [item],
        pagination: {
          firstPage: null,
          lastPage: null,
          prevPage: null,
          nextPage: null,
          pages: [],
        },
      },
    });
    const { getBlogEntries } = await import('./index');

    const { pager } = await getBlogEntries();

    expect(pager?.firstPage).toBe(1);
    expect(pager?.lastPage).toBe(1);
  });

  it('pagination が無いレスポンスでは pager を返さない', async () => {
    get.mockResolvedValue({ data: { items: [item] } });
    const { getBlogEntries } = await import('./index');

    const { pager, entries } = await getBlogEntries();

    expect(pager).toBeUndefined();
    expect(entries).toHaveLength(1);
  });
});
