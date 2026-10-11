import type { Entry } from '@/app/types';
import { fetchBlogEntries } from '@/app/blog/api/client';
import type { SWRMutationConfiguration } from 'swr/mutation';
import useSWRMutation from 'swr/mutation';

async function fetcher(
  _key: string,
  { arg }: { arg: { keyword: string } },
): Promise<Entry[]> {
  const { entries } = await fetchBlogEntries({ keyword: arg.keyword });
  return entries;
}

export default function useBlogEntriesSwrMutation(
  config: SWRMutationConfiguration<Entry[], Error> = {},
) {
  const {
    data: entries = [],
    error,
    trigger,
    reset,
    isMutating,
  } = useSWRMutation('/api/blog', fetcher, config);

  return {
    entries,
    error,
    trigger,
    reset,
    isMutating,
  };
}
