'use client';

import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useEffect } from 'react';

export default function usePageChange(
  onPageChange: (
    pathname: string,
    searchParams: ReadonlyURLSearchParams,
  ) => void,
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onPageChange(pathname, searchParams);
  }, [pathname, searchParams]);
}
