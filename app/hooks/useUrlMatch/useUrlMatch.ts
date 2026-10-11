import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export type UseUrlMatchReturn = {
  isMatchFull: boolean;
  isMatchStart: boolean;
};

/**
 * エンコード済みとデコード済みの表記ゆれ (/tag/日本語/ と /tag/%E6%97%A5...) を
 * 同じものとして比較できるよう、デコードして揃える。
 * 不正なエンコードの場合は、そのまま返す。
 */
function normalize(path: string) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

export default function useUrlMatch(url: URL) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Calculate match results directly with useMemo instead of useEffect + useState
  const { isMatchFull, isMatchStart } = useMemo(() => {
    const href = normalize(
      `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`,
    );
    const target = normalize(`${url.pathname}${url.search}`);

    return {
      isMatchFull: href === target,
      isMatchStart: href.startsWith(target),
    };
  }, [pathname, searchParams, url.search, url.pathname]);

  return { isMatchFull, isMatchStart };
}
