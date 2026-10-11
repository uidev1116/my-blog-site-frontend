import { notFound } from 'next/navigation';
import {
  getAllBlogEntries,
  getTagRelationalEntries,
  getBlogEntry,
} from '../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { acmsPath } from '@uidev1116/acms-js-sdk/acmsPath';
import BlogDetailRoute from '../routes/BlogDetailRoute';

export async function generateMetadata(props: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { openGraph, twitter, ...rest } = await getMetadata({
    blog: 'blog',
    entry: params.code,
  });
  // OGP画像は動的生成した画像を利用する
  delete openGraph?.images;
  delete twitter?.images;
  return {
    ...rest,
    openGraph,
    twitter,
    alternates: {
      canonical: `/${acmsPath({ blog: 'blog', entry: params.code })}`,
    },
  };
}

// 静的書き出しでは、ビルド時に生成した記事だけを配信する
export const dynamicParams = false;

export async function generateStaticParams() {
  const entries = await getAllBlogEntries();

  return entries.map((entry) => ({
    code: entry.code,
  }));
}

export default async function BlogDetailPage(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;
  const { code } = params;
  const entry = await getBlogEntry(code);

  if (entry === null) {
    notFound();
  }

  const relationalEntries = await getTagRelationalEntries(entry.code);
  return (
    <BlogDetailRoute entry={entry} relationalEntries={relationalEntries} />
  );
}
