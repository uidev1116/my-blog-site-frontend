import { loadFont } from '@/app/lib/font/google';
import { ImageResponse } from 'next/og';
import { getBlogEntry } from '../api';
import { MEDIA_BASE_URL } from '@/app/config/acms';

export const runtime = 'edge';

export const revalidate = 10;

export const alt = '記事のOGP画像';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({ params }: { params: { code: string } }) {
  // entry
  const entry = await getBlogEntry(params.code);

  if (entry === null) {
    return new Response('Not Found', { status: 404 });
  }

  // Font
  const notoSansArrayBuffer = await loadFont({
    family: 'Noto Sans JP',
    weight: 700,
    text: entry.title,
  });

  const backgroundImage = `${MEDIA_BASE_URL}${
    entry.blog?.ogpImageBasePath
  }?type=original&?date=${new Date().getTime()}`;

  return new ImageResponse(
    (
      <div
        style={{
          backgroundImage: `url("${backgroundImage}")`,
          backgroundColor: '#fff',
          backgroundSize: '100% 100%',
          height: '100%',
          width: '100%',
          display: 'flex',
          textAlign: 'left',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'column',
          flexWrap: 'nowrap',
        }}
      >
        <div
          style={{
            width: '100%',
            fontSize: 48,
            fontStyle: 'normal',
            fontWeight: 'bold',
            color: '#000',
            padding: '0 120px',
            lineHeight: 1.3,
            marginBottom: '30px',
            wordWrap: 'break-word',
          }}
        >
          {entry.title}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'NotoSansJP',
          data: notoSansArrayBuffer,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  );
}
