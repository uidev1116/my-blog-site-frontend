import { getBlogEntries } from '@/app/blog/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const { entries } = await getBlogEntries({ query: { keyword } });

  return Response.json({ entries });
}
