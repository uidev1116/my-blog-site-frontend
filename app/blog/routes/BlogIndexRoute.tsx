import Link from 'next/link';
import {
  Badge,
  Container,
  EmptyState,
  EntryList,
  Pagination,
  TabList,
  Tab,
} from '@/app/components';
import { Entry } from '@/app/types';

type Props = {
  entries: Entry[];
  pagination?: React.ComponentProps<typeof Pagination>;
  tag?: string;
};

export default function BlogIndexRoute({ entries, pagination, tag }: Props) {
  return (
    <Container>
      <main>
        <div>
          <div>
            <div className="flex flex-col gap-10">
              <TabList>
                <Tab>
                  <Link
                    href="/blog/"
                    className="inline-block rounded-t-lg border-b-2 border-primary p-4"
                    aria-current="page"
                  >
                    Blog
                  </Link>
                </Tab>
                <Tab>
                  <Link
                    href="/blog/zenn/"
                    className="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Zenn
                  </Link>
                </Tab>
              </TabList>
              <div>
                {entries.length > 0 ? (
                  <div className="flex flex-col gap-10">
                    {tag !== undefined && (
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="m-1 inline-flex flex-1">
                            <span>
                              <span className="text-sm text-gray-700 dark:text-white">
                                タグ:
                              </span>
                            </span>
                            <span className="inline-flex flex-1 flex-wrap items-center gap-2 px-3 py-0.5 text-sm">
                              <span>
                                <Badge>#{tag}</Badge>
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 hover:text-primary dark:text-white">
                              <Link href="/blog/">全て表示する</Link>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-12">
                      <div>
                        <EntryList entries={entries} />
                      </div>
                      {pagination !== undefined &&
                        pagination.pages.length > 0 && (
                          <div className="flex justify-center">
                            <Pagination {...pagination} />
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}
