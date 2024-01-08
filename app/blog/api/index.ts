import { resolveRequestCache } from '@/app/utils';
import type { BlogEntry, Tag } from '@/app/types';
import type { AcmsContext } from '@/app/lib/acms/lib/acmsPath';
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
  acmsContext: AcmsContext = {},
): Promise<EntriesResponse> {
  const { data } = await acmsClient.get(
    { ...acmsContext, blog: 'blog', api: 'summary_index' },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { entry: entries = [], pager } = data;

  return {
    entries: entries.map((entry: any) => ({
      id: entry.id,
      code: entry.code,
      sort: entry.sort,
      csort: entry.csort,
      usort: entry.usort,
      status: entry.status,
      title: entry.title,
      path: new URL(entry.url).pathname,
      isNew: entry.isNew,
      createdAt: new Date(entry['date#']),
      updatedAt: new Date(entry['udate#']),
      postedAt: new Date(entry['pdate#']),
      startAt: new Date(entry['sdate#']),
      endAt: new Date(entry['edate#']),
      summary: entry.summary || '',
      tags: (entry.tag || []).map(
        ({ name, url }: { name: string; url: string }) => ({
          name,
          path: new URL(url).pathname,
        }),
      ),
    })),
    ...(pager !== undefined
      ? {
          pager: {
            firstPage: pager.firstPage,
            lastPage: pager.lastPage,
            ...(Object.hasOwn(pager, 'backLink')
              ? {
                  previous: {
                    path: normalizePath(new URL(pager.backLink.url).pathname),
                    num: pager.backLink.backNum,
                    page: pager.backLink.backPage,
                  },
                }
              : {}),
            pages: (pager.page || []).map(
              ({ page, url }: { page: number; url: string }) => ({
                page,
                path: normalizePath(new URL(url).pathname),
              }),
            ),
            ...(Object.hasOwn(pager, 'forwardLink')
              ? {
                  next: {
                    path: normalizePath(
                      new URL(pager.forwardLink.url).pathname,
                    ),
                    num: pager.forwardLink.forwardNum,
                    page: pager.forwardLink.forwardPage,
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

  const { entry: entries = [] } = data;

  return entries.map((entry: any) => ({
    id: entry.id,
    code: entry.code,
    sort: entry.sort,
    csort: entry.csort,
    usort: entry.usort,
    status: entry.status,
    title: entry.title,
    path: new URL(entry.url).pathname,
    isNew: entry.isNew,
    createdAt: new Date(entry['date#']),
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

  const { entry: entries } = data;

  if (!entries.length) {
    return null;
  }

  const [entry] = entries;
  if (entry.code !== entryCode) {
    return null;
  }

  return {
    id: entry.id,
    code: entry.code,
    sort: entry.sort,
    csort: entry.csort,
    usort: entry.usort,
    status: entry.status,
    title: entry.title,
    path: new URL(entry.url).pathname,
    isNew: entry.isNew,
    createdAt: new Date(entry['date#']),
    updatedAt: new Date(entry['udate#']),
    postedAt: new Date(entry['pdate#']),
    startAt: new Date(entry['sdate#']),
    endAt: new Date(entry['edate#']),
    summary: entry.summary,
    tags: (entry.tag || []).map(
      ({ name, url }: { name: string; url: string }) => ({
        name,
        path: new URL(url).pathname,
      }),
    ),
    blog: {
      id: entry.blog.id,
      code: entry.blog.code,
      status: entry.blog.status,
      sort: entry.blog.sort,
      name: entry.blog.name,
      pbid: entry.blog.pbid,
      indexing: entry.blog.indexing,
      path: new URL(entry.blog.url).pathname,
      createdAt: new Date(entry.blog['date#']),
      ogpImageBasePath: entry.blog['ogp_image_base@path'],
    },
    units: entry.unit,
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
