import { Metadata, MetadataRoute } from 'next';
import { MEDIA_BASE_URL } from '../config/acms';
import type { Entry, RootBlog } from '../types';
import { deleteNewLine, resolveRequestCache, truncate } from '../utils';
import { acmsPath, type AcmsPathParams } from '@uidev1116/acms-js-sdk/acmsPath';
import { BASE_URL } from '../config';
import acmsClient from '../lib/acms';
import { isAcmsFetchError } from '@uidev1116/acms-js-sdk';

type EntriesResponse = {
  indexPath: string;
  indexBlogName: string;
  entries: Entry[];
};

export type GlobalNavigation = {
  label: string;
  level: number;
  url: string;
  target: '_blank' | '';
};

export type FooterNavigation = {
  label: string;
  level: number;
  url: string;
  target: '_blank' | '';
};

type Ogp = {
  title: string;
  description: string;
  keywords: string;
  image?: {
    path: string;
    width: number;
    height: number;
  };
};

export async function getBlogEntries(): Promise<EntriesResponse> {
  try {
    const { data } = await acmsClient.get(
      {
        api: 'summary_top_index',
      },
      { requestInit: { cache: resolveRequestCache() } },
    );
    const { indexUrl, indexBlogName, entry: entries = [] } = data;

    return {
      indexPath: new URL(indexUrl).pathname,
      indexBlogName: indexBlogName,
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
    };
  } catch (error) {
    if (isAcmsFetchError(error)) {
      console.error('error.response.data', error.response.data);
      return {
        indexPath: '',
        indexBlogName: '',
        entries: [],
      };
    }
    console.error('error', {
      error,
    });
    return {
      indexPath: '',
      indexBlogName: '',
      entries: [],
    };
  }
}

export async function getGlobalNavigation(): Promise<GlobalNavigation[]> {
  const { data } = await acmsClient.get(
    {
      api: 'navigation_global',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { 'navigation:loop': navs = [] } = data;

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
  const { data } = await acmsClient.get(
    {
      api: 'navigation_footer',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { 'navigation:loop': navs = [] } = data;

  return navs
    .filter((nav: any) => Array.isArray(nav) === false)
    .map((nav: any) => ({
      label: nav.label,
      level: parseInt(nav.level, 10),
      url: nav[0]['link#front']['url'],
      target: nav[0]['link#front']['target'],
    }));
}

export async function getRootBlog(): Promise<RootBlog> {
  const { data } = await acmsClient.get(
    {
      blog: 1,
      api: 'BF_ctx',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const {
    id,
    code = '',
    name,
    facebook_account: facebookAccount,
    twitter_account: twitterAccount,
    github_account: githubAccount,
    youtube_account: youtubeAccount,
    google_site_verification: googleSiteVerification,
    ga_tracking_id: gaId = '',
  } = data;

  return {
    id,
    code,
    name,
    path: '/',
    facebookAccount,
    twitterAccount,
    githubAccount,
    youtubeAccount,
    googleSiteVerification,
    gaId,
  };
}

export async function getOgp(acmsContext: AcmsPathParams = {}): Promise<Ogp> {
  const { data } = await acmsClient.get(
    { ...acmsContext, api: 'ogp' },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const {
    title = '',
    description = '',
    keywords = '',
    image: imagePath = '',
    'image@x': imageWidth = 0,
    'image@y': imageHeight = 0,
  } = data;

  return {
    title,
    description,
    keywords,
    ...(imagePath !== ''
      ? {
          image: {
            path: imagePath,
            width: imageWidth,
            height: imageHeight,
          },
        }
      : {}),
  };
}

export async function getMetadata(
  acmsContext: AcmsPathParams = {},
): Promise<Metadata> {
  const [
    { title, description, keywords, image },
    { name, twitterAccount, googleSiteVerification },
  ] = await Promise.all([getOgp(acmsContext), getRootBlog()]);

  const { blog, category, entry, page, tag, searchParams } = acmsContext;

  function isNoIndex() {
    if (page != null) {
      return true;
    }

    if (tag != null) {
      return true;
    }

    if (
      searchParams != null &&
      new URLSearchParams(searchParams).get('keyword') !== null
    ) {
      return true;
    }

    return false;
  }

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description: deleteNewLine(truncate(description, 350)),
    keywords: keywords || undefined,
    openGraph: {
      title,
      description: deleteNewLine(truncate(description, 350)),
      url: acmsPath({ blog, category, entry }) || '/',
      siteName: name,
      ...(image
        ? {
            images: [
              {
                url: `${MEDIA_BASE_URL}${image.path}`,
                width: image.width,
                height: image.height,
              },
            ],
          }
        : {}),
      locale: 'ja_JP',
      type: entry ? 'article' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: deleteNewLine(truncate(description, 350)),
      creator: `@${twitterAccount}`,
      ...(image
        ? {
            image: `${MEDIA_BASE_URL}${image.path}`,
          }
        : {}),
    },
    ...(googleSiteVerification
      ? {
          verification: {
            google: googleSiteVerification,
          },
        }
      : {}),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      ...(isNoIndex() ? { index: false } : {}),
    },
  };
}

export async function getGaId(): Promise<string> {
  const { gaId } = await getRootBlog();
  return gaId;
}

export async function getSitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await acmsClient.get(
    {
      api: 'sitemap',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { 'url:loop': urls = [] } = data;

  return urls.map((url: any) => ({
    url: new URL(new URL(url.loc).pathname, BASE_URL).toString(),
    lastModified: url.lastmod,
  }));
}
