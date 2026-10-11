import type { ComponentProps } from 'react';
import type { Pagination } from '@/app/components';
import type { EntriesResponse } from '../api';

// ブログ一覧の pager(a-blog cms が返す /blog/page/N/)を、検索ページの URL に組み立て直す
export default function buildSearchPagination(
  pager: EntriesResponse['pager'],
  keyword: string,
  currentPage: number,
): ComponentProps<typeof Pagination> {
  const pathOf = (page: number) =>
    `/blog/search/?keyword=${encodeURIComponent(keyword)}&page=${page}`;

  return {
    currentPage,
    // リンクにクエリを組み立て済みのため、現在のクエリを重ねて付けない
    appendQuery: false,
    previous: pager?.previous && {
      ...pager.previous,
      path: pathOf(pager.previous.page),
    },
    pages: (pager?.pages ?? []).map(({ page }) => ({
      page,
      path: pathOf(page),
    })),
    next: pager?.next && { ...pager.next, path: pathOf(pager.next.page) },
  };
}
