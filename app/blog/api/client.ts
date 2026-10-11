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

/** Worker の API が、成功以外のステータスを返した */
export class FetchError extends Error {
  constructor(public readonly status: number) {
    super(`Failed to fetch entries (${status})`);
    this.name = 'FetchError';
  }
}

// Worker の API(worker/index.ts)は、日付を ISO 文字列で返す。
// 値が無い日付(Invalid Date)は null になるため、undefined に戻す
function reviveEntry(json: Serialized<BlogEntry>): BlogEntry {
  const entry = { ...json } as Record<string, unknown>;
  for (const key of DATE_KEYS) {
    if (typeof entry[key] === 'string') {
      entry[key] = new Date(entry[key]);
    } else if (entry[key] === null) {
      delete entry[key];
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
    throw new FetchError(res.status);
  }

  const { entries = [], pager } = (await res.json()) as {
    entries?: Serialized<BlogEntry>[];
    pager?: EntriesResponse['pager'];
  };
  return { entries: entries.map(reviveEntry), pager };
}

/**
 * 下書きの記事と関連記事を取得する(Worker の GET /api/blog/preview/)。
 * /api/blog/draft/ で発行された Cookie が必要(401: 無い・期限切れ、404: 記事なし)
 */
export async function fetchPreviewEntry(code: string): Promise<{
  entry: BlogEntry;
  relationalEntries: BlogEntry[];
}> {
  const params = new URLSearchParams({ code });

  const res = await fetch(`/api/blog/preview/?${params.toString()}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw new FetchError(res.status);
  }

  const { entry, relationalEntries = [] } = (await res.json()) as {
    entry: Serialized<BlogEntry>;
    relationalEntries?: Serialized<BlogEntry>[];
  };
  return {
    entry: reviveEntry(entry),
    relationalEntries: relationalEntries.map(reviveEntry),
  };
}
