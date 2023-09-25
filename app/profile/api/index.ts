import { API_HOST, API_KEY } from '@/app/config/acms';
import type { Entry } from '@/app/types';

export async function getProfileEntry(): Promise<Entry | null> {
  const res = await fetch(`${API_HOST}/profile/api/body_detail/`, {
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
    url: entries[0].url,
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
