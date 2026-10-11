'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Container } from '@/app/components';
import { fetchBlogEntries } from '../api/client';
import BlogIndexRoute from '../routes/BlogIndexRoute';
import buildSearchPagination from './buildSearchPagination';

function parsePage(value: string | null) {
  return value !== null && /^[1-9][0-9]*$/.test(value)
    ? Number(value)
    : undefined;
}

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

  const { data, error, isLoading } = useSWR(
    ['blog-search', keyword, page],
    ([, k, p]) => fetchBlogEntries({ keyword: k, page: p }),
    { revalidateOnFocus: false },
  );

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
    <BlogIndexRoute
      entries={data.entries}
      pagination={buildSearchPagination(data.pager, keyword, page ?? 1)}
    />
  );
}
