import { getBlogEntries } from '@/app/blog/api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import BlogIndexRoute from '@/app/blog/routes/BlogIndexRoute';

type Props = {
  params: { tag: string };
};

export async function generateMetadata({
  params: { tag },
}: Props): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    tag: [decodeURIComponent(tag)],
  });
}

export default async function BlogIndexPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag);
  const { entries, pager } = await getBlogEntries({ tag: [tag] });

  const props: React.ComponentProps<typeof BlogIndexRoute> = {
    entries,
    pagination: {
      currentPage: 1,
      previous: pager?.previous,
      pages: pager?.pages || [],
      next: pager?.next,
    },
    tag,
  };

  return <BlogIndexRoute {...props} />;
}
