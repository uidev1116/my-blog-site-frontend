import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { PREVIEW_KEY } from '@/app/config/acms';
import { getBlogEntry } from '@/app/blog/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const previewKey = searchParams.get('previewKey');
  const code = searchParams.get('code');

  if (previewKey !== PREVIEW_KEY || code === null) {
    return new Response('Invalid preview key', { status: 401 });
  }

  const entry = await getBlogEntry(code, true);
  if (!entry) {
    return new Response('Invalid entry code', { status: 401 });
  }

  draftMode().enable();

  redirect(entry.path);
}
