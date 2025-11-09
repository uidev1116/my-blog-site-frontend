import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { encodeUri } from '@/app/utils';

export type UseUrlMatchReturn = {
  isMatchFull: boolean;
  isMatchStart: boolean;
};

export default function useUrlMatch(url: URL) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Calculate match results directly with useMemo instead of useEffect + useState
  const { isMatchFull, isMatchStart } = useMemo(() => {
    const href = `${pathname}${
      searchParams.toString() ? `?${searchParams}` : ''
    }`;
    const target = `${url.pathname}${url.search}`;
    const isMatchFull = [href, encodeUri(href)].includes(target);
    const isMatchStart =
      href.startsWith(target) || encodeUri(href).startsWith(target);

    return { isMatchFull, isMatchStart };
  }, [pathname, searchParams, url.search, url.pathname]);

  return { isMatchFull, isMatchStart };
}
