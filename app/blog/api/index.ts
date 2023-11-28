import { API_HOST, API_KEY } from '@/app/config/acms';
import { acmsPath } from '@/app/lib/acmsPath';
import { encodeUri } from '@/app/utils';
import type { BlogEntry, Tag } from '@/app/types';
import type { AcmsContext } from '@/app/lib/acmsPath';

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
  const endpoint = new URL(
    acmsPath({ ...acmsContext, blog: 'blog', api: 'summary_index' }),
    API_HOST,
  );
  const res = await fetch(endpoint, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const { entry: entries = [], pager } = await res.json();

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

export async function getTagRelationalEntries(
  code: string,
): Promise<BlogEntry[]> {
  const endpoint = `${API_HOST}/blog/${code}/api/tag_relational_index/`;
  const res = await fetch(endpoint, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const { 'entry:loop': entries = [] } = await res.json();

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

export async function getBlogEntry(code: string): Promise<BlogEntry | null> {
  const res = await fetch(`${API_HOST}/blog/${code}/api/body_detail/`, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const { entry: entries } = await res.json();
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
    createdAt: new Date(entries[0]['date#']),
    updatedAt: new Date(entries[0]['udate#']),
    postedAt: new Date(entries[0]['pdate#']),
    startAt: new Date(entries[0]['sdate#']),
    endAt: new Date(entries[0]['edate#']),
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
      createdAt: new Date(entries[0].blog['date#']),
      ogpImageBasePath: entries[0].blog['ogp_image_base@path'],
    },
    units: entries[0].unit,
  };
}

export async function getTagFilter(tags: string[]): Promise<TagFilterResponse> {
  const endpoint = `${API_HOST}/blog/tag/${tags
    .map(encodeUri)
    .join('/')}/api/tag_filter/`;
  const res = await fetch(endpoint, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const { 'selected:loop': selected = [], 'choice:loop': selectable = [] } =
    await res.json();

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
