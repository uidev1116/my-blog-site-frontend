'use client';

import BlogIndexRoute from '../routes/BlogIndexRoute';

// TODO: 検索結果を Worker の API から取得して表示する(PR3)
export default function BlogSearchRoute() {
  return <BlogIndexRoute entries={[]} />;
}
