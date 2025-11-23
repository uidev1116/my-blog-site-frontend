'use client';

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  format,
  formatISO9075,
} from 'date-fns';

type Props = Omit<React.ComponentProps<'time'>, 'dateTime'> & {
  createdAt: string;
};

function formatCreatedAt(date: Date, base: Date) {
  const diffInSecs = differenceInSeconds(base, date);
  if (diffInSecs < 60) {
    return `${diffInSecs}秒前`;
  }

  const diffInMins = differenceInMinutes(base, date);
  if (diffInMins < 60) {
    return `${diffInMins}分前`;
  }

  const diffInHours = differenceInHours(base, date);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }

  const diffInDays = differenceInDays(base, date);
  if (diffInDays < 7) {
    return `${diffInDays}日前`;
  }

  const diffInWeeks = differenceInWeeks(base, date);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}週間前`;
  }

  const diffInMonths = differenceInMonths(base, date);
  // 4週間前でも 0ヶ月前と表示されるため、条件を足して絞り込む
  if (diffInWeeks >= 4 && diffInMonths < 2) {
    return `1ヶ月前`;
  }

  if (diffInMonths < 7) {
    return `${diffInMonths}ヶ月前`;
  }

  // 半年以上前の日付は、絶対日時で表示する
  return format(date, 'yyyy/MM/dd');
}

export default function CreatedTime({ createdAt, className }: Props) {
  const now = new Date();
  return (
    <time
      dateTime={formatISO9075(new Date(createdAt))}
      className={className}
      suppressHydrationWarning // https://nextjs.org/docs/messages/react-hydration-error#solution-3-using-suppresshydrationwarning
    >
      {formatCreatedAt(new Date(createdAt), now)}
    </time>
  );
}
