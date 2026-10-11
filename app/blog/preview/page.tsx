import { Metadata } from 'next';
import { Suspense } from 'react';
import BlogPreviewRoute from './BlogPreviewRoute';

// 下書きのプレビュー。記事の内容は、ブラウザで Worker の API(/api/blog/preview/)から取得する
export const metadata: Metadata = {
  title: 'プレビュー',
  robots: { index: false, follow: false },
};

export default function BlogPreviewPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center">読み込み中...</p>}>
      <BlogPreviewRoute />
    </Suspense>
  );
}
