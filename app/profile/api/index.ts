import acmsClient from '@/app/lib/acms';
import type { Entry } from '@/app/types';
import { resolveRequestCache } from '@/app/utils';

export async function getProfileEntry(): Promise<Entry | null> {
  const { data } = await acmsClient.get(
    {
      category: 'profile',
      api: 'body_detail',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { items: entries = [] } = data;

  if (!entries.length) {
    return null;
  }

  return {
    id: entries[0].eid,
    code: entries[0].ecd,
    status: entries[0].status,
    sort: entries[0].sort,
    csort: entries[0].csort,
    usort: entries[0].usort,
    title: entries[0].title,
    path: new URL(entries[0].url).pathname,
    isNew: entries[0].isNew,
    createdAt: new Date(entries[0].datetime),
    updatedAt: new Date(entries[0].updatedAt),
    postedAt: new Date(entries[0].createdAt),
    startAt: new Date(entries[0].publishStartAt),
    endAt: new Date(entries[0].publishEndAt),
    summary: entries[0].summary || '',
    body: entries[0].body,
  };
}
