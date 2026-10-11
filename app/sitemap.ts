import { MetadataRoute } from 'next';
import { getSitemap } from './api';

// 静的書き出しでは、ビルド時に生成する
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await getSitemap();
}
