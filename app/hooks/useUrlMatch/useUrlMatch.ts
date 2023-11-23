import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { encodeUri } from '@/app/utils';

export type UrlMatchType = 'full' | 'startWith';

export default function useUrlMatch(url: URL, type: UrlMatchType) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    const href = `${pathname}${searchParams.toString() && `?${searchParams}`}`;
    const target = `${url.pathname}${url.search}`;
    setIsMatch(
      {
        full() {
          return [href, encodeUri(href)].includes(target);
        },
        startWith() {
          return href.startsWith(target) || encodeUri(href).startsWith(target);
        },
      }[type](),
    );
  }, [pathname, searchParams, url.search, url.pathname, type]);

  return isMatch;
}
