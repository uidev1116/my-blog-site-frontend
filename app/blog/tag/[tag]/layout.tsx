import { getAllBlogTags } from '@/app/blog/tag/api';

export async function generateStaticParams() {
  const tags = await getAllBlogTags();
  return tags.map((tag) => ({
    tag,
  }));
}

export default function TagLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
