import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Music2, RefreshCw } from 'lucide-react';
import { getArtistProfile, getMediaUrl } from '@/lib/api';
import RichText from '../../_components/RichText';
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

      <section
        className={`bio-feature${artist?.aboutBackgroundImage ? ' has-bg' : ' warm-section'}`}
        style={
          artist?.aboutBackgroundImage
            ? {
                backgroundImage: `url('${getMediaUrl(artist.aboutBackgroundImage)}')`,
              }
            : undefined
        }
      >
        {artist?.aboutBackgroundImage && <div className="bio-feature-overlay" aria-hidden="true" />}
        <div className="bio-section">
          <div className="bio-grid">
            <div className="bio-text">
              <div className={`section-label ${artist?.aboutBackgroundImage ? '' : styles.warmLabel}`}>Full Story</div>
              <h2 className={`section-title ${artist?.aboutBackgroundImage ? '' : styles.warmTitle}`}>The <em className={artist?.aboutBackgroundImage ? '' : styles.amberEm}>journey</em></h2>
              {artist?.bio
                ? <RichText content={artist.bio as Parameters<typeof RichText>[0]['content']} className={styles.richBio} />
                : <>
                    <p>Poshbugati grew up listening to country melodies but found his heartbeat in Afrobeat. Born in Jos, Nigeria and now a Florida resident, he blends Nigerian rhythms with American country soul to forge a bold new path: Afro Country. From sunlit guitar licks to infectious Afrobeat grooves, this American-Nigerian artist weaves traditions into one electrifying soundscape. From Lagos nights to Miami days, follow Poshbugati as he redefines genre lines, one groove at a time.</p>
                    <p>Rooted in Nigerian heritage, shaped by American country soul, Afro Country celebrates unity through music.</p>
                  </>
              }
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
