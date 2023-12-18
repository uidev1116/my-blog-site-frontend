import { resolveRequestCache } from '@/app/utils';
import type { BlogEntry, Tag } from '@/app/types';
import type { AcmsContext } from '@/app/lib/acms/lib/acmsPath';
import acmsClient from '@/app/lib/acms';
import { utcToZonedTime } from 'date-fns-tz';

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
      createdAt: utcToZonedTime(new Date(entry['date#']), 'Asia/Tokyo'),
      updatedAt: utcToZonedTime(new Date(entry['udate#']), 'Asia/Tokyo'),
      postedAt: utcToZonedTime(new Date(entry['pdate#']), 'Asia/Tokyo'),
      startAt: utcToZonedTime(new Date(entry['sdate#']), 'Asia/Tokyo'),
      endAt: utcToZonedTime(new Date(entry['edate#']), 'Asia/Tokyo'),
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
    createdAt: utcToZonedTime(new Date(entry['date#']), 'Asia/Tokyo'),
  }));
}

export async function getTagRelationalEntries(
  entryCode: string,
): Promise<BlogEntry[]> {
  const { data } = await acmsClient.get(
    {
      blog: 'blog',
      entry: entryCode,
      api: 'tag_relational_index',
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
    createdAt: utcToZonedTime(new Date(entry['date#']), 'Asia/Tokyo'),
    updatedAt: utcToZonedTime(new Date(entry['udate#']), 'Asia/Tokyo'),
    postedAt: utcToZonedTime(new Date(entry['pdate#']), 'Asia/Tokyo'),
    startAt: utcToZonedTime(new Date(entry['sdate#']), 'Asia/Tokyo'),
    endAt: utcToZonedTime(new Date(entry['edate#']), 'Asia/Tokyo'),
    summary: entry.summary || '',
  }));
}

export async function getBlogEntry(
  entryCode: string,
): Promise<BlogEntry | null> {
  const { data } = await acmsClient.get(
    {
      blog: 'blog',
      entry: entryCode,
      api: 'body_detail',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { entry: entries } = data;

  if (!entries.length) {
    return null;
  }

  return {
    id: entries[0].id,
    code: entries[0].code,
    sort: entries[0].sort,
    csort: entries[0].csort,
    usort: entries[0].usort,
    status: entries[0].status,
    title: entries[0].title,
    path: new URL(entries[0].url).pathname,
    isNew: entries[0].isNew,
    createdAt: utcToZonedTime(new Date(entries[0]['date#']), 'Asia/Tokyo'),
    updatedAt: utcToZonedTime(new Date(entries[0]['udate#']), 'Asia/Tokyo'),
    postedAt: utcToZonedTime(new Date(entries[0]['pdate#']), 'Asia/Tokyo'),
    startAt: utcToZonedTime(new Date(entries[0]['sdate#']), 'Asia/Tokyo'),
    endAt: utcToZonedTime(new Date(entries[0]['edate#']), 'Asia/Tokyo'),
    summary: entries[0].summary,
    tags: (entries[0].tag || []).map(
      ({ name, url }: { name: string; url: string }) => ({
        name,
        path: new URL(url).pathname,
      }),
    ),
    blog: {
      id: entries[0].blog.id,
      code: entries[0].blog.code,
      status: entries[0].blog.status,
      sort: entries[0].blog.sort,
      name: entries[0].blog.name,
      pbid: entries[0].blog.pbid,
      indexing: entries[0].blog.indexing,
      path: new URL(entries[0].blog.url).pathname,
      createdAt: utcToZonedTime(
        new Date(entries[0].blog['date#']),
        'Asia/Tokyo',
      ),
      ogpImageBasePath: entries[0].blog['ogp_image_base@path'],
    },
    units: entries[0].unit,
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
