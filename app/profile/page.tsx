import { notFound } from 'next/navigation';
import { getProfileEntry } from './api';
import { Metadata } from 'next';
import { getMetadata } from '../api';
import ProfileRoute from './routes/ProfileRoute';

export async function generateMetadata(): Promise<Metadata> {
  const { openGraph, ...rest } = await getMetadata({ category: 'profile' });
  return {
    ...rest,
    openGraph: {
      ...openGraph,
      type: 'profile',
    },
  };
}

export default async function ProfilePage() {
  const entry = await getProfileEntry();

  if (entry === null) {
    notFound();
  }

  return <ProfileRoute entry={entry} />;
}
