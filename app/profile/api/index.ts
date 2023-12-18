import acmsClient from '@/app/lib/acms';
import type { Entry } from '@/app/types';
import { resolveRequestCache } from '@/app/utils';
import { utcToZonedTime } from 'date-fns-tz';

export async function getProfileEntry(): Promise<Entry | null> {
  const { data } = await acmsClient.get(
    {
      category: 'profile',
      api: 'body_detail',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  const { entry: entries } = data;

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
    createdAt: utcToZonedTime(new Date(entries[0]['date#']), 'Asia/Tokyo'),
    updatedAt: utcToZonedTime(new Date(entries[0]['udate#']), 'Asia/Tokyo'),
    postedAt: utcToZonedTime(new Date(entries[0]['pdate#']), 'Asia/Tokyo'),
    startAt: utcToZonedTime(new Date(entries[0]['sdate#']), 'Asia/Tokyo'),
    endAt: utcToZonedTime(new Date(entries[0]['edate#']), 'Asia/Tokyo'),
    summary: entries[0].summary,
    category: entries[0].category,
    units: entries[0].unit,
  };
}
