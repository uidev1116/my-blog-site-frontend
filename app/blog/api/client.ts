import type { BlogEntry } from '@/app/types';
// 型だけを読み込む(サーバー側のコードをブラウザ向けのバンドルに含めない)
import type { EntriesResponse } from './index';

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | undefined ? string | undefined : T[K];
};

const DATE_KEYS = [
  'createdAt',
  'updatedAt',
  'postedAt',
  'startAt',
  'endAt',
] as const;

// Worker の API(worker/index.ts)は、日付を ISO 文字列で返す
function reviveEntry(json: Serialized<BlogEntry>): BlogEntry {
  const entry = { ...json } as Record<string, unknown>;
  for (const key of DATE_KEYS) {
    if (typeof entry[key] === 'string') {
      entry[key] = new Date(entry[key]);
    }
  }
  return entry as unknown as BlogEntry;
}

/**
 * 記事を検索する(Worker の GET /api/blog/)
 */
export async function fetchBlogEntries({
  keyword,
  page,
}: {
  keyword: string;
  page?: number;
}): Promise<EntriesResponse> {
  const params = new URLSearchParams({ keyword });
  if (page !== undefined) {
    params.set('page', String(page));
  }

  const res = await fetch(`/api/blog/?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch entries (${res.status})`);
  }

  const { entries = [], pager } = (await res.json()) as {
    entries?: Serialized<BlogEntry>[];
    pager?: EntriesResponse['pager'];
  };
  return { entries: entries.map(reviveEntry), pager };
}
