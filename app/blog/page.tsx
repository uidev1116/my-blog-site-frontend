import { getBlogEntries } from './api';
import { Metadata } from 'next';
import { getMetadata } from '../api';
import BlogIndexRoute from './routes/BlogIndexRoute';

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata({ blog: 'blog' });
}

export default async function BlogIndexPage() {
  const { entries, pager } = await getBlogEntries();

  const props: React.ComponentProps<typeof BlogIndexRoute> = {
    entries,
    pagination: {
      currentPage: 1,
      previous: pager?.previous,
      pages: pager?.pages || [],
      next: pager?.next,
    },
  };

  return <BlogIndexRoute {...props} />;
}
