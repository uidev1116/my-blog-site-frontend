import { getBlogEntries } from '@/app/blog/api';
import { range } from '@/app/utils';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import BlogIndexRoute from '@/app/blog/routes/BlogIndexRoute';

type Props = {
  params: Promise<{ tag: string; page: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { tag, page } = params;

  return await getMetadata({
    blog: 'blog',
    page: parseInt(page, 10),
    tag: [decodeURIComponent(tag)],
  });
}

export async function generateStaticParams({
  params: { tag },
}: {
  params: { tag: string };
}) {
  const { pager } = await getBlogEntries({ tag: [decodeURIComponent(tag)] });
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndexPage(props0: {
  params: Promise<{ tag: string; page: string }>;
}) {
  const params = await props0.params;
  const tag = decodeURIComponent(params.tag);
  const page = parseInt(params.page);
  const { entries, pager } = await getBlogEntries({
    tag: [tag],
    page,
  });

  const props: React.ComponentProps<typeof BlogIndexRoute> = {
    entries,
    pagination: {
      currentPage: page,
      previous: pager?.previous,
      pages: pager?.pages || [],
      next: pager?.next,
    },
    tag,
  };

  return <BlogIndexRoute {...props} />;
}
