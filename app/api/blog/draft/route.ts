import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { PREVIEW_KEY } from '@/app/config/acms';
import { getBlogEntry } from '@/app/blog/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const previewKey = searchParams.get('previewKey');
  const code = searchParams.get('code');

  if (previewKey === null || previewKey === '') {
    return new Response('Preview key is required', { status: 400 });
  }
  if (code === null || code === '') {
    return new Response('Entry code is required', { status: 400 });
  }
  if (previewKey !== PREVIEW_KEY) {
    return new Response('Preview key is invalid', { status: 401 });
  }

  const entry = await getBlogEntry(code, true);
  if (!entry) {
    return new Response('Entry not found', { status: 404 });
  }

  (await draftMode()).enable();
  redirect(entry.path);
}
