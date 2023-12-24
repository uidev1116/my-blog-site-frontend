import { getBlogEntries } from '../../../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { objToSearchParams } from '@/app/utils';
import { acmsPath } from '@/app/lib/acms/lib/acmsPath';
import BlogIndexRoute from '@/app/blog/routes/BlogIndexRoute';

type Props = {
  params: { page: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    page: parseInt(params.page, 10),
    searchParams: objToSearchParams(searchParams),
  });
}

export default async function BlogSearchPage({ params, searchParams }: Props) {
  const page = parseInt(params.page, 10);
  const { entries, pager } = await getBlogEntries({
    page,
    searchParams: objToSearchParams(searchParams),
  });

  const props: React.ComponentProps<typeof BlogIndexRoute> = {
    entries,
    pagination: {
      currentPage: page,
      previous: pager?.previous && {
        ...pager.previous,
        path: `/blog/search/${acmsPath({ page: pager.previous.page })}`,
      },
      pages:
        pager?.pages.map((page) => ({
          ...page,
          path: `/blog/search/${acmsPath({ page: page.page })}`,
        })) || [],
      next: pager?.next && {
        ...pager.next,
        path: `/blog/search/${acmsPath({ page: pager.next.page })}`,
      },
    },
  };

  return <BlogIndexRoute {...props} />;
}
