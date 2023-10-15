import { API_HOST, API_KEY } from '@/app/config/acms';

export async function getAllBlogTags(): Promise<string[]> {
  const endpoint = `${API_HOST}/blog/api/tag_index/`;
  const res = await fetch(endpoint, {
    headers: new Headers({
      'X-API-KEY': API_KEY,
    }),
    cache: 'no-cache',
  });

  console.log('response', res);

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  const { 'tag:loop': tags } = await res.json();

  console.log(tags);

  return (tags || []).map((tag: { name: string }) => tag.name);
}
