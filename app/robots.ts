import { MetadataRoute } from 'next';
import { BASE_URL } from './config';

// 静的書き出しでは、ビルド時に生成する
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', BASE_URL).toString(),
  };
}
