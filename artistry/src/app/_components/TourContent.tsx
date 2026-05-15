'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSubscription } from '@/lib/api';
import type { TourShow } from '@/payload-types';
import styles from './TourContent.module.css';

interface Props {
  upcomingShows: TourShow[];
  pastShows: TourShow[];
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return { month: '', day: '', year: '' };
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
    year: String(d.getFullYear()),
  };
}

function typeBadgeClass(type?: string | null) {
  if (type === 'Festival') return 'badge-teal';
  if (type === 'Tour') return 'badge-gold';
  return 'badge-amber';
}

function ShowRow({ show, isPast }: { show: TourShow; isPast: boolean }) {
  const { month, day, year } = formatDate(show.date);
  return (
    <div className={`show-row${show.soldOut ? ' sold-out' : ''}`}>
      <div className="show-date-block">
        <div className="show-month">{month}</div>
        <div className="show-day">{day}</div>
        <div className="show-year">{year}</div>
      </div>
      <div className="show-info">
        <div className="show-name">{show.venue}</div>
        <div className="show-venue">{show.city}{show.country ? `, ${show.country}` : ''}</div>
        {show.notes && <div className="show-city">{show.notes}</div>}
      </div>
      <span className={`show-type badge ${typeBadgeClass(show.type)}`}>{show.type}</span>
      <div className="show-action">
        {isPast
          ? <span className="sold-label">Passed</span>
          : show.soldOut
            ? <span className="sold-label">Sold Out</span>
            : show.ticketUrl
              ? <a href={show.ticketUrl} target="_blank" rel="noreferrer">Get Tickets</a>
              : <span className="sold-label">TBA</span>
        }
      </div>
    </div>
  );
}

export default function TourContent({ upcomingShows, pastShows }: Props) {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const handleNotify = async () => {
    if (!email.trim()) return;
    setNotifyLoading(true);
    try {
      await createSubscription({ email: email.trim(), type: 'Tour Notifications' });
      setNotified(true);
      setEmail('');
    } catch {
    }
    setNotifyLoading(false);
  };

  return (
    <>
      <div className={styles.tabsBar}>
        <div className="tour-tabs">
          <button
            className={`tour-tab${tab === 'upcoming' ? ' active' : ''}`}
            onClick={() => setTab('upcoming')}
          >
            Upcoming Shows
          </button>
          <button
            className={`tour-tab${tab === 'past' ? ' active' : ''}`}
            onClick={() => setTab('past')}
          >
            Past Shows
          </button>
        </div>
      </div>

      <section className="section-pad">
        <div className="section-wrap">

          {tab === 'upcoming' && (
            <div>
              <div className="shows-list">
                {upcomingShows.map((s) => <ShowRow key={s.id} show={s} isPast={false} />)}
              </div>
              <div className="tour-map">
                <div className="map-label">Tour map<br />[ interactive map placeholder ]</div>
              </div>
            </div>
          )}

          {tab === 'past' && (
            <div className="shows-list">
              {pastShows.map((s) => <ShowRow key={s.id} show={s} isPast={true} />)}
            </div>
          )}

          <div className="tour-notify">
            <h3>Don&apos;t miss a show</h3>
            <p>Get notified when new tour dates drop in your city.</p>
            <div className="notify-form">
              <input
                type="email"
                className="notify-input"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="notify-btn" onClick={handleNotify} disabled={notifyLoading}>
                {notifyLoading ? 'Submitting…' : 'Notify Me'}
              </button>
            </div>
            {notified && (
              <p className={styles.notifyMsg}>✓ You&apos;re on the list!</p>
            )}
          </div>

          <div className={styles.bookingBlock}>
            <div>
              <div className="section-label">Promoters &amp; Festivals</div>
              <h3 className={styles.bookingTitle}>
                Book <em className={styles.bookingTitleEm}>Poshbugati</em>
              </h3>
              <p className={styles.bookingDesc}>
                Available for live performances, festival slots, private events, and brand partnerships. Reach out for a full rider and technical specs.
              </p>
            </div>
            <Link href="/contact" className="btn btn-gold">Get in Touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
