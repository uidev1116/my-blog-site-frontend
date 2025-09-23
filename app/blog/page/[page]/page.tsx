import { range } from '@/app/utils';
import { getBlogEntries } from '../../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import BlogIndexRoute from '../../routes/BlogIndexRoute';

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  return await getMetadata({ blog: 'blog', page: parseInt(params.page, 10) });
}

export async function generateStaticParams() {
  const { pager } = await getBlogEntries();
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndexPage(props0: {
  params: Promise<{ page: string }>;
}) {
  const params = await props0.params;
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
