'use client';

import { useSyncExternalStore } from 'react';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
} from 'date-fns';

type Props = Omit<React.ComponentProps<'time'>, 'dateTime'> & {
  // a-blog cms の日時(yyyy-MM-dd HH:mm:ss)。タイムゾーンなしの日本時間
  createdAt: string;
};

// 日本時間の文字列を、正しい時刻(Date)にする。
// そのまま new Date すると、実行環境(UTC のビルドサーバーなど)のタイムゾーンで読まれて、9 時間ずれる
function parseJst(createdAt: string) {
  return new Date(`${createdAt.replace(' ', 'T')}+09:00`);
}

// yyyy/MM/dd。文字列のまま整形するので、実行環境のタイムゾーンに依存しない
function formatDate(createdAt: string) {
  return createdAt.slice(0, 10).replaceAll('-', '/');
}

function formatCreatedAt(createdAt: string, now: Date) {
  const date = parseJst(createdAt);
  // 未来の日時(時計のずれなど)でも、マイナスの表示にしない
  const diffInSecs = Math.max(0, differenceInSeconds(now, date));
  if (diffInSecs < 60) {
    return `${diffInSecs}秒前`;
  }

  const diffInMins = differenceInMinutes(now, date);
  if (diffInMins < 60) {
    return `${diffInMins}分前`;
  }

  const diffInHours = differenceInHours(now, date);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }

  const diffInDays = differenceInDays(now, date);
  if (diffInDays < 7) {
    return `${diffInDays}日前`;
  }

  const diffInWeeks = differenceInWeeks(now, date);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}週間前`;
  }

  const diffInMonths = differenceInMonths(now, date);
  // 4週間前でも 0ヶ月前と表示されるため、条件を足して絞り込む
  if (diffInWeeks >= 4 && diffInMonths < 2) {
    return `1ヶ月前`;
  }

  if (diffInMonths < 7) {
    return `${diffInMonths}ヶ月前`;
  }

  // 半年以上前の日付は、絶対日時で表示する
  return formatDate(createdAt);
}

// 現在時刻の共有ストア。ブラウザでだけ使い、1 分ごとに更新して、開いたままのページの「〇分前」も新しくする
const listeners = new Set<() => void>();
let snapshot: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  snapshot = Date.now();
  timer ??= setInterval(() => {
    snapshot = Date.now();
    listeners.forEach((l) => l());
  }, 60 * 1000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => (snapshot ??= Date.now());
// サーバー(ビルド時)とハイドレーション中は、時刻を持たない
const getServerSnapshot = () => null;

export default function CreatedTime({ createdAt, className }: Props) {
  // 相対表示(〇分前)は、ブラウザで表示したあとに計算する。
  // サーバー(ビルド時)で計算すると、ビルドした時刻が HTML に焼き込まれて、リロードで古い・ずれた表示になる。
  // サーバーと最初の描画は、時刻に依存しない絶対日付にして、ハイドレーションの不一致も防ぐ
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <time dateTime={createdAt} className={className}>
      {now === null
        ? formatDate(createdAt)
        : formatCreatedAt(createdAt, new Date(now))}
    </time>
  );
}
