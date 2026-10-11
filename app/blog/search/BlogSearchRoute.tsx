'use client';

import { useSearchParams } from 'next/navigation';
import useSWR, { type SWRConfiguration } from 'swr';
import { Container } from '@/app/components';
import { FetchError, fetchBlogEntries } from '../api/client';
import BlogIndexRoute from '../routes/BlogIndexRoute';
import buildSearchPagination from './buildSearchPagination';

// 不正な page は、1 ページ目として扱う
function parsePage(value: string | null) {
  return value !== null && /^[1-9][0-9]*$/.test(value) ? Number(value) : 1;
}

const MAX_RETRIES = 3;

// 入力が不正(4xx)なら再試行しても同じ結果のため、再試行しない。それ以外は、間隔を空けて数回だけ再試行する
const onErrorRetry: SWRConfiguration['onErrorRetry'] = (
  error,
  _key,
  config,
  revalidate,
  { retryCount },
) => {
  if (error instanceof FetchError && error.status < 500) {
    return;
  }
  if (retryCount >= MAX_RETRIES) {
    return;
  }
  setTimeout(
    () => revalidate({ retryCount: retryCount + 1 }),
    config.errorRetryInterval * 2 ** retryCount,
  );
};

function Message({
  role,
  children,
}: {
  role: 'status' | 'alert';
  children: React.ReactNode;
}) {
  return (
    <Container>
      <main>
        <p role={role} className="py-20 text-center">
          {children}
        </p>
      </main>
    </Container>
  );
}

// 検索結果は静的に書き出せないため、ブラウザで Worker の API(/api/blog/)から取得する
export default function BlogSearchRoute() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const page = parsePage(searchParams.get('page'));

  const { data, error, isLoading, isValidating } = useSWR(
    // キーワードが空なら、取得しない
    keyword === '' ? null : (['blog-search', keyword, page] as const),
    async ([, k, p]) => ({
      ...(await fetchBlogEntries({ keyword: k, page: p })),
      // 結果と、その検索条件を対応づける(ページ移動中に、古い結果へ新しいページ番号を出さない)
      keyword: k,
      page: p,
    }),
    {
      revalidateOnFocus: false,
      // ページ移動中も、前の結果を表示し続ける(画面が消えて跳ねるのを防ぐ)
      keepPreviousData: true,
      onErrorRetry,
    },
  );

  if (keyword === '') {
    return <Message role="status">キーワードを入力してください。</Message>;
  }
  if (error) {
    return (
      <Message role="alert">
        検索に失敗しました。時間をおいて、もう一度お試しください。
      </Message>
    );
  }
  if (isLoading || !data) {
    return <Message role="status">検索中...</Message>;
  }

  return (
    <div aria-busy={isValidating}>
      <BlogIndexRoute
        entries={data.entries}
        pagination={buildSearchPagination(data.pager, data.keyword, data.page)}
      />
    </div>
  );
}
