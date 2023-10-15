import { API_HOST, API_KEY } from '../config/acms';
import type { Entry } from '../types';
import type { UrlMatchType } from '@/app/hooks';

type EntriesResponse = {
  indexPath: string;
  indexBlogName: string;
  entries: Entry[];
};

type GlobalNavigation = {
  label: string;
  level: number;
  url: string;
  matchType: UrlMatchType | '';
  target: '_blank' | '';
};

type FooterNavigation = {
  label: string;
  level: number;
  url: string;
  target: '_blank' | '';
};

export async function getBlogEntries(): Promise<EntriesResponse> {
  const endpoint = `${API_HOST}/api/summary_top_index/`;
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

  const { indexUrl, indexBlogName, entry: entries = [] } = await res.json();

  return {
    indexPath: new URL(indexUrl).pathname,
    indexBlogName: indexBlogName,
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
  };
}

export async function getGlobalNavigation(): Promise<GlobalNavigation[]> {
  const endpoint = `${API_HOST}/api/navigation_global/`;
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

  const { 'navigation:loop': navs = [] } = await res.json();

  return navs
    .filter((nav: any) => Array.isArray(nav) === false)
    .map((nav: any) => ({
      label: nav.label,
      level: parseInt(nav.level, 10),
      url: nav[0]['link#front']['url'],
      matchType: nav.attr.trim(),
      target: nav[0]['link#front']['target'],
    }));
}

export async function getFooterNavigation(): Promise<FooterNavigation[]> {
  const endpoint = `${API_HOST}/api/navigation_footer/`;
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

  const { 'navigation:loop': navs = [] } = await res.json();

  return navs
    .filter((nav: any) => Array.isArray(nav) === false)
    .map((nav: any) => ({
      label: nav.label,
      level: parseInt(nav.level, 10),
      url: nav[0]['link#front']['url'],
      target: nav[0]['link#front']['target'],
    }));
}
