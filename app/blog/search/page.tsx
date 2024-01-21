import acmsPath from '@uidev1116/acms-js-sdk/acmsPath';
import { getBlogEntries } from '../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { objToSearchParams } from '@/app/utils';
import BlogIndexRoute from '../routes/BlogIndexRoute';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  return await getMetadata({
    blog: 'blog',
    searchParams: objToSearchParams(searchParams),
  });
}

export default async function BlogSearchPage({ searchParams }: Props) {
  const { entries, pager } = await getBlogEntries({
    searchParams: objToSearchParams(searchParams),
  });

  const props: React.ComponentProps<typeof BlogIndexRoute> = {
    entries,
    pagination: {
      currentPage: 1,
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
