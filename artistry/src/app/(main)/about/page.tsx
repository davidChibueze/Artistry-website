import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Music2, RefreshCw } from 'lucide-react';
import { getArtistProfile, getMediaUrl } from '@/lib/api';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const artist = await getArtistProfile().catch(() => null);
  return {
    title: 'About',
    description: artist?.bio ? 'About Poshbugati' : 'Raised on Afrobeat rhythms, shaped by country soul storytelling. Poshbugati is the architect of a sound that refuses to belong to just one place.',
  };
}

export default async function AboutPage() {
  const artist = await getArtistProfile().catch(() => null);

  const principles: Array<{ icon?: string | null; title?: string | null; description?: string | null }> = artist?.principles ?? [
    { icon: 'authenticity', title: 'Cultural Honesty', description: 'Every note carries its origin with pride. Afrobeat rhythms are not decorative — they are structural.' },
    { icon: 'emotion', title: 'Emotional Truth', description: 'Country music taught the world that a song can break you open in three minutes.' },
    { icon: 'movement', title: 'Genre as Movement', description: 'Afro country is a living idea — defined not by rules, but by the willingness to keep crossing lines.' },
  ];

  const timeline: Array<{ year?: number | null; title?: string | null }> = artist?.timeline ?? [
    { year: 2020, title: 'The First Recordings' },
    { year: 2022, title: 'Going Independent' },
    { year: 2023, title: 'The Podcast Launches' },
    { year: 2024, title: 'Writing The Switch' },
    { year: 2025, title: 'The Switch Drops' },
  ];

  const pressQuotes: Array<{ quote?: string | null; author?: string | null; publication?: string | null }> = artist?.pressQuotes ?? [
    { quote: "Poshbugati is doing something genuinely new. The Switch doesn't sound like a debut — it sounds like an arrival.", author: '', publication: 'Music Week Africa' },
    { quote: 'Where most fusion feels borrowed, this feels earned. New Roots is the kind of track that opens a genre.', author: '', publication: 'The Lagos Beat' },
    { quote: 'Afro country was always coming. Poshbugati just got there first.', author: '', publication: 'Rolling Stone Africa' },
  ];

  return (
    <>
      <div className="about-hero">
        <div className="ah-left">
          <div className="page-kicker">The Artist</div>
          <h1 className="page-title">Born between<br /><em>two worlds.</em></h1>
          <p className={`page-sub ${styles.pageSub}`}>
            {artist?.tagline || 'Raised on Afrobeat rhythms, shaped by country soul storytelling. Poshbugati is the architect of a sound that refuses to belong to just one place.'}
          </p>
        </div>
        <div
          className="ah-right"
          style={{
            backgroundImage: artist?.portraitImage ? `url('${getMediaUrl(artist.portraitImage)}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="ah-right-label">Artist portrait</div>
        </div>
      </div>

      <section className="warm-section">
        <div className="bio-section">
          <div className="bio-grid">
            <div className="bio-text">
              <div className={`section-label ${styles.warmLabel}`}>Full Story</div>
              <h2 className={`section-title ${styles.warmTitle}`}>The <em className={styles.amberEm}>journey</em></h2>
              <p><strong>{artist?.name || 'Emmanuel George Akpose'}</strong>, better known as Poshbugati, was born in Jos, Plateau State, Nigeria — and has always remained true to his humble beginnings. Originally from Isoko South in Delta State, he was exposed to music at a young age while singing in the church choir. That was when he knew this path was carved out for him.</p>
              <p>Now a Miami resident, Poshbugati draws inspiration from legends like Afrobeats pioneer <strong>Fela Kuti</strong>, <strong>Tupac</strong>, and <strong>Bob Marley</strong> — using the musicality of those before him to steer his propulsive Afro-pop sound into new territory.</p>
              <p>With mammoth singles like <strong>&ldquo;AJE&rdquo;</strong> and the <strong>Influencer Whoop Remix</strong> — an Afro-Dancehall collaboration featuring Jamaican reggae star <strong>Gyptian</strong> — he continues to push boundaries. His Amapiano record <strong>&ldquo;Outsiders&rdquo;</strong> is a top-shelf feel-good vibe that further cements his range.</p>
              <blockquote>&ldquo;With his flexible and multifaceted disposition, Poshbugati is no pushover — he still has in his kitty a collaboration with Bizzy Bone of the legendary Bone Thugs &lsquo;N&rsquo; Harmony.&rdquo;</blockquote>
              <p>A talent oozing of innate instinct for marking steps in the sands of musical timing — Poshbugati is only just getting started.</p>
            </div>
            <div>
              <div className="timeline">
                <h3>Timeline</h3>
                {timeline.map(({ year, title }) => (
                  <div key={year} className="tl-item">
                    <div className="tl-year">{year}</div>
                    <div className="tl-content">
                      <h4>{title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`section-pad ${styles.bg2Section}`}>
        <div className="section-wrap">
          <div className="section-label">What Drives the Music</div>
          <h2 className="section-title">Three <em>principles</em></h2>
          <div className="values-grid">
            {principles.map(({ title, description }) => (
              <div key={title} className="value-card">
                <div className="value-icon"><Globe className={styles.valueIcon} /></div>
                <div className="value-title">{title}</div>
                <div className="value-desc">{description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="section-wrap">
          <div className="section-label">What People Are Saying</div>
          <h2 className="section-title">Press <em>Quotes</em></h2>
          <div className="press-quotes">
            {pressQuotes.map(({ quote, publication }) => (
              <div key={publication} className="pq">
                <div className="pq-text">&ldquo;{quote}&rdquo;</div>
                <div className="pq-source">{publication}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.epkSection}>
        <div className={styles.epkInner}>
          <div className={`section-label ${styles.centeredLabel}`}>Press &amp; Media</div>
          <h2 className={`section-title ${styles.epkTitle}`}>Need the <em>full story?</em></h2>
          <p className={styles.epkDesc}>
            Download the full press kit, high-resolution photos, and official bio. For interview requests and media inquiries, reach out directly.
          </p>
          <div className={styles.epkActions}>
            <Link href="/media" className="btn btn-gold">Download Press Kit</Link>
            <Link href="/contact" className="btn btn-outline">Request an Interview</Link>
          </div>
        </div>
      </section>
    </>
  );
}
