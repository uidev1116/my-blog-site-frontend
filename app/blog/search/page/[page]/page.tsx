import { getBlogEntries } from '../../../api';
import { Metadata } from 'next';
import { getMetadata } from '@/app/api';
import { objToSearchParams } from '@/app/utils';
import acmsPath from '@uidev1116/acms-js-sdk/acmsPath';
import BlogIndexRoute from '@/app/blog/routes/BlogIndexRoute';

type Props = {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return await getMetadata({
    blog: 'blog',
    page: parseInt(params.page, 10),
    searchParams: objToSearchParams(searchParams),
  });
}

export default async function BlogSearchPage(props0: Props) {
  const searchParams = await props0.searchParams;
  const params = await props0.params;
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
