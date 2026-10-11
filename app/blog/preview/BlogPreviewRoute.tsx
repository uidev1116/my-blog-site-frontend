'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import { Container } from '@/app/components';
import { applyBuildIn } from '@/app/lib/buildIn';
import { FetchError, fetchPreviewEntry } from '../api/client';
import BlogDetailRoute from '../routes/BlogDetailRoute';

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

function errorMessage(error: unknown) {
  if (error instanceof FetchError) {
    if (error.status === 401) {
      return 'プレビューの有効期限が切れました。管理画面から、もう一度プレビューを開いてください。';
    }
    if (error.status === 404) {
      return '記事が見つかりません。';
    }
  }
  return 'プレビューの取得に失敗しました。時間をおいて、もう一度お試しください。';
}

export default function BlogPreviewRoute() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';

  const { data, error, isLoading } = useSWR(
    // code が無ければ、取得しない
    code === '' ? null : (['blog-preview', code] as const),
    ([, c]) => fetchPreviewEntry(c),
    {
      revalidateOnFocus: false,
      // ネットワーク復帰時の再取得で、表示済みの下書きがエラー表示に置き換わるのを防ぐ
      revalidateOnReconnect: false,
      // 認証切れ(401)や記事なし(404)は、再試行しても同じ結果
      shouldRetryOnError: false,
    },
  );

  // 本文は、ページの表示後に取得して描画する。目次・外部リンク・表のスクロールなどは、
  // 本文が DOM に出てから作る必要があるため、取得できたら適用する(BuildInJs は、ページを開いた直後にしか動かない)
  useEffect(() => {
    if (data) {
      applyBuildIn(document);
    }
  }, [data]);

  if (code === '') {
    return (
      <Message role="status">プレビューする記事が指定されていません。</Message>
    );
  }
  if (error) {
    return <Message role="alert">{errorMessage(error)}</Message>;
  }
  if (isLoading || !data) {
    return <Message role="status">読み込み中...</Message>;
  }

  return (
    <>
      <div
        role="note"
        className="bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-900"
      >
        プレビュー表示中です(下書きの内容。公開されたページではありません)。
      </div>
      <BlogDetailRoute
        entry={data.entry}
        relationalEntries={data.relationalEntries}
      />
    </>
  );
}
