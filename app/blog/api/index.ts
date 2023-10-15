import { API_HOST, API_KEY } from '@/app/config/acms';
import { acmsPath } from '@/app/lib';
import type { AcmsContext, Entry } from '@/app/types';

type EntriesResponse = {
  entries: Entry[];
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

export async function getBlogEntries(
  acmsContext: AcmsContext = {},
): Promise<EntriesResponse> {
  const endpoint = `${API_HOST}/blog${acmsPath(
    acmsContext,
  )}/api/summary_index/`;
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
                    path: new URL(pager.backLink.url).pathname,
                    num: pager.backLink.backNum,
                    page: pager.backLink.backPage,
                  },
                }
              : {}),
            pages: pager.page.map(
              ({ page, url }: { page: number; url: string }) => ({
                page,
                path: new URL(url).pathname,
              }),
            ),
            ...(Object.hasOwn(pager, 'forwardLink')
              ? {
                  next: {
                    path: new URL(pager.forwardLink.url).pathname,
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

export async function getTagRelationalEntries(code: string): Promise<Entry[]> {
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

export async function getBlogEntry(code: string): Promise<Entry | null> {
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
    units: entries[0].unit,
  };
}
