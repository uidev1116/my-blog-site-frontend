import { notFound } from 'next/navigation';
import {
  getAllBlogEntries,
  getTagRelationalEntries,
  getBlogEntry,
} from '../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { acmsPath } from '@/app/lib';
import BlogDetailRoute from '../routes/BlogDetailRoute';

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
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
      canonical: acmsPath({ blog: 'blog', entry: params.code }),
    },
  };
}

export async function generateStaticParams() {
  const entries = await getAllBlogEntries();

  return entries.map((entry) => ({
    code: entry.code,
  }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const [entry, relationalEntries] = await Promise.all([
    getBlogEntry(code),
    getTagRelationalEntries(code),
  ]);

  if (entry === null) {
    notFound();
  }

  return (
    <BlogDetailRoute entry={entry} relationalEntries={relationalEntries} />
  );
}
