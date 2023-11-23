import { Container, EmptyState, EntryList, Pagination } from '@/app/components';
import { range } from '@/app/utils';
import { getBlogEntries } from '../../api';
import { Metadata } from 'next';
import { getOGP } from '@/app/api';

export async function generateMetadata({
  params,
}: {
  params: { page: string };
}): Promise<Metadata> {
  return {
    ...(await getOGP(`/blog/page/${params.page}`)),
    robots: {
      index: false,
    },
  };
}

export async function generateStaticParams() {
  const { pager } = await getBlogEntries();
  return range(pager?.firstPage || 1, pager?.lastPage || 1).map((page) => ({
    page: page.toString(),
  }));
}

export default async function BlogIndex({
  params,
}: {
  params: { page: string };
}) {
  const { page } = params;
  const { entries, pager } = await getBlogEntries({ page: parseInt(page, 10) });

  if (entries.length === 0) {
    return (
      <Container>
        <main>
          <EmptyState />
        </main>
      </Container>
    );
  }

  return (
    <Container>
      <main>
        <div className="flex flex-col gap-12">
          <div>
            <EntryList entries={entries} />
          </div>
          {pager !== undefined && pager.pages.length > 0 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={parseInt(page, 10)}
                previous={pager?.previous}
                pages={pager?.pages}
                next={pager?.next}
              />
            </div>
          )}
        </div>
      </main>
    </Container>
  );
}
