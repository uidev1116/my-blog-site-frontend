import { draftMode } from 'next/headers';
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
import { PREVIEW_KEY } from '@/app/config/acms';

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const { isEnabled } = draftMode();
  const { openGraph, twitter, ...rest } = await getMetadata({
    blog: 'blog',
    entry: params.code,
    ...(isEnabled
      ? { searchParams: new URLSearchParams({ previewKey: PREVIEW_KEY }) }
      : {}),
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
  const { isEnabled } = draftMode();
  const [entry, relationalEntries] = await Promise.all([
    getBlogEntry(code, isEnabled),
    getTagRelationalEntries(code, isEnabled),
  ]);

  if (entry === null) {
    notFound();
  }

  return (
    <BlogDetailRoute entry={entry} relationalEntries={relationalEntries} />
  );
}
