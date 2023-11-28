import acmsClient from '@/app/lib/acms';
import type { Entry } from '@/app/types';
import { resolveRequestCache } from '@/app/utils';

export async function getProfileEntry(): Promise<Entry | null> {
  const { entry: entries } = await acmsClient.get(
    {
      category: 'profile',
      api: 'body_detail',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

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
    category: entries[0].category,
    units: entries[0].unit,
  };
}
