import { getSiteSettings } from '@/lib/api';
import Link from 'next/link';
import { Music } from 'lucide-react';
import styles from './AnnounceBar.module.css';

export default async function AnnounceBar() {
  const settings = await getSiteSettings().catch(() => null);
  const bar = settings?.announcementBar;

  if (!bar || !bar.enabled) return null;

  const now = new Date();
  const start = bar.startDate ? new Date(bar.startDate) : null;
  const end = bar.endDate ? new Date(bar.endDate) : null;

  if (start && now < start) return null;
  if (end && now > end) return null;

  return (
    <div className="announce-bar">
      <span>
        <Music className={styles.icon} />
        {bar.text}
      </span>
      {bar.linkUrl && bar.linkText ? (
        <Link href={bar.linkUrl}>{bar.linkText} →</Link>
      ) : null}
    </div>
  );
}
