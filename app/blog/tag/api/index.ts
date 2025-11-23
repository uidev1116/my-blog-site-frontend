import acmsClient from '@/app/lib/acms';
import { resolveRequestCache } from '@/app/utils';

export async function getAllBlogTags(): Promise<string[]> {
  const { data } = await acmsClient.get(
    {
      blog: 'blog',
      api: 'tag_index',
    },
    {
      requestInit: { cache: resolveRequestCache() },
      acmsPathOptions: { apiVersion: 'v1' },
    },
  );

  const { 'tag:loop': tags = [] } = data;

  return tags.map((tag: { name: string }) => tag.name);
}
