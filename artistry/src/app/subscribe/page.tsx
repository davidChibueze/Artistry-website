import type { Metadata } from 'next';
import SubscribePageClient from '../_components/SubscribePageClient';
import { getSiteSettings } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Early Access — Poshbugati',
    description: 'Join the inner circle. Get 48-hour early stream access to The Switch EP, digital liner notes, merch bundle priority, and a direct message from the artist.',
  };
}

export default async function SubscribePage() {
  const settings = await getSiteSettings().catch(() => null);

  return <SubscribePageClient epReleaseDate={settings?.epReleaseDate} />;
}
