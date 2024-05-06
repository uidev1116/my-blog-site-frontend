import { MetadataRoute } from 'next';
import { getSitemap } from './api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await getSitemap();
}
