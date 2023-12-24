import HomeRoute from '@/app/routes/HomeRoute';
import { getBlogEntries, getMetadata } from '@/app/api';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata();
}

export default async function HomePage() {
  const { indexPath, indexBlogName, entries } = await getBlogEntries();

  return (
    <HomeRoute
      blogPath={indexPath}
      blogName={indexBlogName}
      entries={entries}
    />
  );
}
