import { MetadataRoute } from 'next';
import { BASE_URL } from './config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', BASE_URL).toString(),
  };
}
