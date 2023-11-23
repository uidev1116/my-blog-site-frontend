'use client';

import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function usePageChange(
  onPageChange: (
    pathname: string,
    searchParams: ReadonlyURLSearchParams,
  ) => void,
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (pathname: string, searchParams: ReadonlyURLSearchParams) => {
      onPageChange(pathname, searchParams);
    },
    // 再レンダリングを防ぐために、onPageChangeを依存配列に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    handlePageChange(pathname, searchParams);
  }, [pathname, searchParams, handlePageChange]);
}
