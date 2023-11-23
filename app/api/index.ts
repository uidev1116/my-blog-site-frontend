import { Metadata } from 'next';
import { API_HOST, API_KEY } from '../config/acms';
import type { Blog, Entry } from '../types';
import { deleteNewLine, truncate } from '../utils';
import { AcmsContext, acmsPath } from '../lib';

type EntriesResponse = {
  indexPath: string;
  indexBlogName: string;
  entries: Entry[];
};

type GlobalNavigation = {
  label: string;
  level: number;
  url: string;
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

export async function getBlog(blogId: number = 1): Promise<Blog> {
  const endpoint = `${API_HOST}/bid/${blogId}/api/BF_ctx/`;
  const res = await fetch(endpoint, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const {
    id,
    code = '',
    status,
    sort,
    name,
    parent: pbid,
    indexing,
    generated_datetime: generatedDatetime,
    twitter_account: twitterAccount,
  } = await res.json();

  return {
    id,
    code,
    status,
    sort,
    name,
    pbid,
    indexing,
    path: '/',
    createdAt: new Date(generatedDatetime),
    twitterAccount,
  };
}

export async function getOGP(acmsContext: AcmsContext = {}): Promise<Metadata> {
  const endpoint = new URL(acmsPath({ ...acmsContext, api: 'ogp' }), API_HOST);
  const res = await fetch(endpoint, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  const { name, twitterAccount } = await getBlog(1);

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const {
    title = '',
    description = '',
    keywords = '',
    image = '',
    'image@x': imageX = 0,
    'image@y': imageY = 0,
    type,
  } = await res.json();

  const imageUrl = `${API_HOST}/media/${image}`;

  return {
    title,
    description: deleteNewLine(truncate(description, 350)),
    keywords: keywords || undefined,
    openGraph: {
      title,
      description: deleteNewLine(truncate(description, 350)),
      url: 'https://uidev.jp',
      siteName: name,
      images: [
        {
          url: imageUrl,
          width: imageX,
          height: imageY,
        },
      ],
      locale: 'ja_JP',
      type: type,
    },
    twitter: {
      card: 'summary',
      title,
      description: deleteNewLine(truncate(description, 350)),
      creator: `@${twitterAccount}`,
      images: {
        url: imageUrl,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}
