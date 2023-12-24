import { range } from '@/app/utils';
import { getBlogEntries } from '../../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import BlogIndexRoute from '../../routes/BlogIndexRoute';

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  return await getMetadata({ blog: 'blog', page: parseInt(params.page, 10) });
}

export async function generateStaticParams() {
  const { pager } = await getBlogEntries();
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndexPage({
  params,
}: {
  params: { page: string };
}) {
  const page = parseInt(params.page);
  const { entries, pager } = await getBlogEntries({ page });

  const props: React.ComponentProps<typeof BlogIndexRoute> = {
    entries,
    pagination: {
      currentPage: page,
      previous: pager?.previous,
      pages: pager?.pages || [],
      next: pager?.next,
    },
  };

  return <BlogIndexRoute {...props} />;
}
