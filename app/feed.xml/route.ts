import { Feed } from 'feed';
import { getOgp } from '../api';
import { deleteNewLine, truncate } from '../utils';
import { BASE_URL, COPYRIGHT_START_YEAR, SITE_HOST } from '../config';
import { getRssFeed } from './api';
import { MEDIA_BASE_URL } from '../config/acms';

// 静的書き出しでは、ビルド時に feed.xml として生成する
export const dynamic = 'force-static';

export async function GET() {
  const PROFILE_URL = new URL('/profile/', BASE_URL).toString();
  const [ogp, rss] = await Promise.all([getOgp(), getRssFeed()]);

  const feed = new Feed({
    title: ogp.title,
    description: deleteNewLine(truncate(ogp.description, 350)),
    id: BASE_URL,
    link: BASE_URL,
    image: ogp.image?.path
      ? new URL(ogp.image.path, MEDIA_BASE_URL).toString()
      : undefined,
    copyright: `© ${COPYRIGHT_START_YEAR} ${SITE_HOST}. All Rights Reserved.`,
    updated: rss.lastBuildDate,
    generator: 'a-blog cms',
    author: {
      name: 'uidev1116',
      email: 'uidev1116@gmail.com',
      link: PROFILE_URL,
    },
  });

  rss.items.forEach((item) => {
    feed.addItem({
      title: item.title,
      id: item.link,
      link: item.link,
      ...(item.category ? { category: [{ name: item.category }] } : {}),
      author: [
        {
          name: item.creator,
          email: 'uidev1116@gmail.com',
          link: PROFILE_URL,
        },
      ],
      date: item.pubDate,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
