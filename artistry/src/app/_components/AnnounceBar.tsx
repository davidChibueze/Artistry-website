import { getSiteSettings } from '@/lib/api';
import AnnounceBarClient from './AnnounceBarClient';

export default async function AnnounceBar() {
  const settings = await getSiteSettings().catch(() => null);
  const bar = settings?.announcementBar;

  if (!bar || !bar.enabled || !bar.text) return null;

  const now = new Date();
  const start = bar.startDate ? new Date(bar.startDate) : null;
  const end = bar.endDate ? new Date(bar.endDate) : null;

  if (start && now < start) return null;
  if (end && now > end) return null;

  return (
    <AnnounceBarClient
      text={bar.text}
      linkText={bar.linkText}
      linkUrl={bar.linkUrl}
    />
  );
}
