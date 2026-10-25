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
    const { indexUrl, indexBlogName, items: entries = [] } = data;

    return {
      indexPath: new URL(indexUrl).pathname,
      indexBlogName: indexBlogName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
  );

  const { 'navigation:loop': navs = [] } = data;

  return (
    navs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((nav: any) => Array.isArray(nav) === false && nav['link#front'])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((nav: any) => ({
        label: nav.label,
        level: parseInt(nav.level, 10),
        url: nav['link#front']['url'],
        target: nav['link#front']['target'],
      }))
  );
}

export async function getFooterNavigation(): Promise<FooterNavigation[]> {
  const { data } = await acmsClient.get(
    {
      api: 'navigation_footer',
    },
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
  );

  const { 'navigation:loop': navs = [] } = data;

  return (
    navs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((nav: any) => Array.isArray(nav) === false && nav['link#front'])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((nav: any) => ({
        label: nav.label,
        level: parseInt(nav.level, 10),
        url: nav['link#front']['url'],
        target: nav['link#front']['target'],
      }))
  );
}

async function fetchBlogContext(blog: AcmsPathParams['blog']) {
  const { data } = await acmsClient.get(
    {
      blog,
      api: 'BF_ctx',
    },
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
  );
  return data;
}

// チェックボックス(blog_meta_robots[]) は配列、単一値の場合は文字列で返る
function isNoIndexField(value: unknown): boolean {
  return Array.isArray(value) ? value.includes('noindex') : value === 'noindex';
}

export async function getRootBlog(): Promise<RootBlog> {
  const {
    id,
    code = '',
    name,
    twitter_account: twitterAccount,
    google_site_verification: googleSiteVerification,
    ga_tracking_id: gaId = '',
    script_head: scriptHead = '',
    script_body_start: scriptBodyStart = '',
    script_body_end: scriptBodyEnd = '',
    blog_meta_robots: blogMetaRobots,
  } = await fetchBlogContext(1);

  return {
    id,
    code,
    name,
    path: '/',
    twitterAccount,
    googleSiteVerification,
    gaId,
    scriptHead,
    scriptBodyStart,
    scriptBodyEnd,
    noIndex: isNoIndexField(blogMetaRobots),
  };
}

export async function getBlogNoIndex(
  blog: AcmsPathParams['blog'],
): Promise<boolean> {
  const { blog_meta_robots: blogMetaRobots } = await fetchBlogContext(blog);
  return isNoIndexField(blogMetaRobots);
}

export async function getOgp(acmsContext: AcmsPathParams = {}): Promise<Ogp> {
  const { data } = await acmsClient.get(
    { ...acmsContext, api: 'ogp' },
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
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
    title: String(title),
    description: String(description),
    keywords: String(keywords),
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
  const { blog, category, entry, page, tag, searchParams } = acmsContext;

  const [
    { title, description, keywords, image },
    { name, twitterAccount, googleSiteVerification, noIndex: isRootNoIndex },
    isBlogNoIndex,
  ] = await Promise.all([
    getOgp(acmsContext),
    getRootBlog(),
    blog != null ? getBlogNoIndex(blog) : undefined,
  ]);

  function isNoIndex() {
    // ブログ単位の設定。対象のブログがあればそのブログ、無ければルートブログ
    if (isBlogNoIndex ?? isRootNoIndex) {
      return true;
    }

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
      ...(twitterAccount ? { creator: `@${twitterAccount}` } : {}),
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

export async function getSitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await acmsClient.get(
    {
      api: 'sitemap',
    },
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
  );

  const { 'url:loop': urls = [] } = data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return urls.map((url: any) => ({
    url: new URL(new URL(url.loc).pathname, BASE_URL).toString(),
    lastModified: url.lastmod,
  }));
}
