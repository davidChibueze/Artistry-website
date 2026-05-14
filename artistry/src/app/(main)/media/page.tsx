import type { Metadata } from 'next';
import MediaContent from '../../_components/MediaContent';
import { getMediaGallery } from '@/lib/api';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Media & Press',
  description: 'Photos, videos, press coverage, and downloadable assets for journalists, bloggers, and content creators. All materials cleared for editorial use.',
};

export default async function MediaPage() {
  const [photosRes, videosRes, pressRes] = await Promise.all([
    getMediaGallery({ type: 'Photo' }).catch(() => ({ docs: [], totalDocs: 0 })),
    getMediaGallery({ type: 'Video' }).catch(() => ({ docs: [], totalDocs: 0 })),
    getMediaGallery({ type: 'Press Quote' }).catch(() => ({ docs: [], totalDocs: 0 })),
  ]);

  return (
    <>
      <div className="media-hero">
        <div className={styles.heroInner}>
          <div className="page-kicker">Press &amp; Media</div>
          <h1 className="page-title">Media <em>Kit</em></h1>
          <p className="page-sub">Photos, videos, press coverage, and downloadable assets for journalists, bloggers, and content creators. All materials cleared for editorial use.</p>
        </div>
      </div>
      <MediaContent photos={photosRes.docs} videos={videosRes.docs} pressQuotes={pressRes.docs} />
    </>
  );
}
