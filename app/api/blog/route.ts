import { getBlogEntries } from '@/app/blog/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { entries } = await getBlogEntries({ searchParams });

  return Response.json({ entries });
}
