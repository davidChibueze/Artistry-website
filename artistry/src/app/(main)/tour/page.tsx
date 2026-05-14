import type { Metadata } from 'next';
import TourContent from '../../_components/TourContent';
import { getTourShows } from '@/lib/api';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Tour Dates',
  description: 'Catch Poshbugati live as The Switch takes the stage. From intimate venues to festival headliners — the Afro country movement is on the road.',
};

export default async function TourPage() {
  const [upcomingRes, pastRes] = await Promise.all([
    getTourShows({ upcoming: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getTourShows().catch(() => ({ docs: [], totalDocs: 0 })),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = upcomingRes.docs;
  const past = pastRes.docs.filter(s => s.date < today);

  return (
    <>
      <div className="tour-hero">
        <div className={styles.heroInner}>
          <div className="page-kicker">Live Shows</div>
          <h1 className="page-title">Tour <em>Dates</em></h1>
          <p className="page-sub">Catch Poshbugati live as The Switch takes the stage. From intimate venues to festival headliners — the Afro country movement is on the road.</p>
        </div>
      </div>
      <TourContent upcomingShows={upcoming} pastShows={past} />
    </>
  );
}
