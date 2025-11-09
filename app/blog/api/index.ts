import { resolveRequestCache } from '@/app/utils';
import type { BlogEntry, Tag } from '@/app/types';
import type { AcmsPathParams } from '@uidev1116/acms-js-sdk/acmsPath';
import acmsClient from '@/app/lib/acms';
import { PREVIEW_KEY } from '@/app/config/acms';

type EntriesResponse = {
  entries: BlogEntry[];
  pager?: {
    firstPage: number;
    lastPage: number;
    previous?: {
      path: string;
      num: number;
      page: number;
    };
    pages: {
      page: number;
      path: string;
    }[];
    next?: {
      path: string;
      num: number;
      page: number;
    };
  };
};

type TagFilterResponse = {
  selected: Tag &
    {
      omitPath: string;
    }[];
  selectable: Tag[];
};

function normalizePath(path: string) {
  return path.replace(/\/keyword\/[^\/]+/, '');
}

export async function getBlogEntries(
  acmsContext: AcmsPathParams = {},
): Promise<EntriesResponse> {
  const { data } = await acmsClient.get(
    { ...acmsContext, blog: 'blog', api: 'summary_index' },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { items: entries = [], pagination } = data;

  return {
    entries: entries.map((entry: any) => ({
      id: entry.eid,
      code: entry.ecd,
      sort: entry.sort,
      csort: entry.csort,
      usort: entry.usort,
      status: entry.status,
      title: entry.title,
      path: new URL(entry.url).pathname,
      isNew: entry.isNew,
      createdAt: new Date(entry.datetime),
      updatedAt: new Date(entry.updatedAt),
      postedAt: new Date(entry.createdAt),
      startAt: new Date(entry.publishStartAt),
      endAt: new Date(entry.publishEndAt),
      summary: entry.summary || '',
      tags: (entry.tags || []).map(
        ({ name, url }: { name: string; url: string }) => ({
          name,
          path: new URL(url).pathname,
        }),
      ),
    })),
    ...(pagination !== undefined
      ? {
          pager: {
            firstPage: pagination.firstPage,
            lastPage: pagination.lastPage,
            ...(pagination.prevPage !== null
              ? {
                  previous: {
                    path: normalizePath(
                      new URL(pagination.prevPage.url).pathname,
                    ),
                    num: pagination.prevPage.count,
                    page: pagination.prevPage.page,
                  },
                }
              : {}),
            pages: (pagination.pages || []).map(
              ({ page, url }: { page: number; url: string }) => ({
                page,
                path: normalizePath(new URL(url).pathname),
              }),
            ),
            ...(pagination.nextPage !== null
              ? {
                  next: {
                    path: normalizePath(
                      new URL(pagination.nextPage.url).pathname,
                    ),
                    num: pagination.nextPage.count,
                    page: pagination.nextPage.page,
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}

export async function getAllBlogEntries(): Promise<BlogEntry[]> {
  const { data } = await acmsClient.get(
    { blog: 'blog', api: 'summary_blog_all' },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { items: entries = [] } = data;

  return entries.map((entry: any) => ({
    id: entry.eid,
    code: entry.ecd,
    sort: entry.sort,
    csort: entry.csort,
    usort: entry.usort,
    status: entry.status,
    title: entry.title,
    path: new URL(entry.url).pathname,
    isNew: entry.isNew,
    createdAt: new Date(entry.datetime),
  }));
}

export async function getTagRelationalEntries(
  entryCode: string,
  isPreview: boolean = false,
): Promise<BlogEntry[]> {
  const { data } = await acmsClient.get(
    {
      blog: 'blog',
      entry: entryCode,
      api: 'tag_relational_index',
      ...(isPreview
        ? { searchParams: new URLSearchParams({ previewKey: PREVIEW_KEY }) }
        : {}),
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { 'entry:loop': entries = [] } = data;

  return entries.map((entry: any) => ({
    id: entry.eid,
    code: entry.ecd,
    sort: entry.sort,
    csort: entry.csort,
    usort: entry.usort,
    status: entry.status,
    title: entry.title,
    path: new URL(entry.url).pathname,
    createdAt: new Date(entry['date#']),
    updatedAt: new Date(entry['udate#']),
    postedAt: new Date(entry['pdate#']),
    startAt: new Date(entry['sdate#']),
    endAt: new Date(entry['edate#']),
    summary: entry.summary || '',
  }));
}

export async function getBlogEntry(
  entryCode: string,
  isPreview: boolean = false,
): Promise<BlogEntry | null> {
  const { data } = await acmsClient.get(
    {
      blog: 'blog',
      entry: entryCode,
      api: 'body_detail',
      ...(isPreview
        ? { searchParams: new URLSearchParams({ previewKey: PREVIEW_KEY }) }
        : {}),
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { items: entries = [] } = data;

  if (!entries.length) {
    return null;
  }

  const [entry] = entries;
  if (entry.code !== entryCode) {
    return null;
  }

  return {
    id: entry.eid,
    code: entry.ecd,
    sort: entry.sort,
    csort: entry.csort,
    usort: entry.usort,
    status: entry.status,
    title: entry.title,
    path: new URL(entry.url).pathname,
    isNew: entry.isNew,
    createdAt: new Date(entry.datetime),
    updatedAt: new Date(entry.updatedAt),
    postedAt: new Date(entry.createdAt),
    startAt: new Date(entry.publishStartAt),
    endAt: new Date(entry.publishEndAt),
    summary: entry.summary || '',
    tags: (entry.tags || []).map(
      ({ name, url }: { name: string; url: string }) => ({
        name,
        path: new URL(url).pathname,
      }),
    ),
    blog: {
      id: entry.blog.bid,
      code: entry.blog.code,
      name: entry.blog.name,
      path: new URL(entry.blog.url).pathname,
      ogpImageBasePath: entry.blog['ogp_image_base@path'],
    },
    body: entry.body,
  };
}

export async function getTagFilter(tags: string[]): Promise<TagFilterResponse> {
  const { data } = await acmsClient.get(
    {
      blog: 'blog',
      tag: tags,
      api: 'tag_filter',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { 'selected:loop': selected = [], 'choice:loop': selectable = [] } =
    data;

  return {
    selected: selected.map(
      ({
        name,
        path,
        omitUrl,
      }: {
        name: string;
        path: string;
        omitUrl: string;
      }) => ({
        name,
        path,
        omitPath: new URL(omitUrl).pathname,
      }),
    ),
    selectable: selectable.map(
      ({ name, path }: { name: string; path: string }) => ({
        name,
        path,
      }),
    ),
  };
}
