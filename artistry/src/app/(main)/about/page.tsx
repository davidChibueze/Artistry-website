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
              <p><strong>{artist?.name || 'Poshbugati'}</strong> is what happens when the dust of the savanna meets the open road. Raised between two musical traditions — one rooted in the pulse and groove of West African rhythm, the other in the wide-open emotional honesty of country soul — he spent years learning that these sounds weren&apos;t opposites. They were always the same conversation.</p>
              <p>Growing up surrounded by Afrobeat, highlife, and the storytelling traditions of both African and country music, Poshbugati developed an ear for what makes a song land emotionally, regardless of geography. The guitar could be playing under a setting sun in the Sahel or a Tennessee highway — the feeling is the same.</p>
              <p>His debut EP, <strong>The Switch</strong>, is not an experiment. It is a declaration. A confident first step into territory that belongs to no one yet — and now belongs to him. Each of the five tracks is a chapter in a story about identity, movement, belonging, and joy.</p>
              <blockquote>&ldquo;Afro country isn&apos;t a trend — it&apos;s a moved-into-new-ground sound. When you press play, you&apos;re invited to move, groove, and discover a world where sun-kissed rhythms meet heartfelt storytelling.&rdquo;</blockquote>
              <p>Poshbugati is not interested in genre labels as boxes. The Switch uses them as doors — wide open, inviting anyone willing to step through into something genuinely new.</p>
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
