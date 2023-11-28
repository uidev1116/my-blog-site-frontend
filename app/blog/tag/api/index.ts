import acmsClient from '@/app/lib/acms';
import { resolveRequestCache } from '@/app/utils';

export async function getAllBlogTags(): Promise<string[]> {
  const { 'tag:loop': tags = [] } = await acmsClient.get(
    {
      blog: 'blog',
      api: 'tag_index',
    },
    { requestInit: { cache: resolveRequestCache() } },
  );

  return tags.map((tag: { name: string }) => tag.name);
}
