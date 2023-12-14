import type { Entry } from '@/app/types';
import { encodeUri } from '@/app/utils';
import type { SWRMutationConfiguration } from 'swr/mutation';
import useSWRMutation from 'swr/mutation';

async function fetcher(
  url: string,
  { arg }: { arg: { keyword: string } },
): Promise<Entry[]> {
  const res = await fetch(`${url}?keyword=${encodeUri(arg.keyword)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const { entries } = await res.json();
  return entries as Entry[];
}

export default function useBlogEntriesSwrMutation(
  config: SWRMutationConfiguration<Entry[], any> = {},
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
