import { BASE_URL } from '@/app/config';
import acmsClient from '@/app/lib/acms';
import { resolveRequestCache } from '@/app/utils';
import { AcmsContext } from '@uidev1116/acms-js-sdk/acmsPath';

export type RssFeedItem = {
  title: string;
  link: string;
  pubDate: Date;
  category: string;
  permalink: string;
  creator: string;
};

export type RssFeed = {
  items: RssFeedItem[];
  lastBuildDate: Date;
};

export async function getRssFeed(
  acmsContext: AcmsContext = {},
): Promise<RssFeed> {
  const { data } = await acmsClient.get(
    { ...acmsContext, api: 'feed' },
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
  );
  const { 'item:loop': items = [], lastBuildDate } = data;
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: items.map((item: any) => ({
      title: item.title,
      link: new URL(new URL(item.link).pathname, BASE_URL).toString(),
      pubDate: new Date(item.pubDate),
      category: item.category,
      permalink: new URL(new URL(item.permalink).pathname, BASE_URL).toString(),
      creator: item.creator,
    })),
    lastBuildDate: new Date(lastBuildDate),
  };
}
