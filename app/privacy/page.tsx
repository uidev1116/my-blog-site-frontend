import { notFound } from 'next/navigation';
import { getPrivacyEntry } from './api';
import { Metadata } from 'next';
import { getMetadata } from '../api';
import PrivacyRoute from './routes/PrivacyRoute';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({ category: 'privacy' });
}

export default async function PrivacyPage() {
  const entry = await getPrivacyEntry();

  if (entry === null) {
    notFound();
  }

  return <PrivacyRoute entry={entry} />;
}
