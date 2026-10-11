import { Metadata } from 'next';
import { Suspense } from 'react';
import { getMetadata } from '@/app/api';
import BlogSearchRoute from './BlogSearchRoute';

// 検索結果はブラウザで取得するため、ページ自体は静的に書き出す
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getMetadata({ blog: 'blog' });
  return { ...metadata, robots: { index: false, follow: true } };
}

export default function BlogSearchPage() {
  return (
    <Suspense>
      <BlogSearchRoute />
    </Suspense>
  );
}
