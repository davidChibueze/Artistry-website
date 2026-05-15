import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import HomeSubscribeForm from '../_components/HomeSubscribeForm';
import { getArtistProfile, getReleases, getTourShows, getBlogPosts, getSiteSettings, getMediaUrl } from '@/lib/api';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const [artist, settings] = await Promise.all([
    getArtistProfile().catch(() => null),
    getSiteSettings().catch(() => null),
  ]);

  return {
    title: artist?.name || 'Poshbugati',
    description: settings?.siteDescription || 'Afro country artist. The Switch EP — exclusive on poshbugati.com.',
    openGraph: {
      images: settings?.ogImage && typeof settings.ogImage === 'object' && settings.ogImage.url
        ? [{ url: getMediaUrl(settings.ogImage) }]
        : undefined,
    },
  };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function HomePage() {
  const [artist, releasesRes, showsRes, blogRes, settings] = await Promise.all([
    getArtistProfile().catch(() => null),
    getReleases({ featured: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getTourShows({ upcoming: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getBlogPosts({ published: true, limit: 4 }).catch(() => ({ docs: [], totalDocs: 0 })),
    getSiteSettings().catch(() => null),
  ]);

  const releases = releasesRes.docs.slice(0, 3);
  const shows = showsRes.docs.slice(0, 3);
  const blogPosts = blogRes.docs;
  const epDate = settings?.epReleaseDate;
  const featured = releasesRes.docs[0];

  const PLATFORM_COLORS: Record<string, string> = {
    'Spotify': '#1DB954',
    'Apple Music': '#FC3C44',
    'YouTube Music': '#FF0000',
    'Amazon Music': '#FF9900',
    'Tidal': '#00FFFF',
    'Deezer': '#FEAA2D',
    'SoundCloud': '#FF7700',
  };

  const streamingLinks = (featured?.streamingLinks ?? []).filter(
    (l) => !!l.platform && !!l.url
  ) as Array<{ id: string; platform: string; url: string }>;

  return (
    <>
      <section id="hero">
        <div
          className="hero-bg"
          style={{
            backgroundImage: artist?.heroImage ? `url('${getMediaUrl(artist.heroImage)}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="hero-content">
          <div className="hero-eyebrow">{artist?.tagline || 'Afro Country · New EP'}</div>
          <h1 className="hero-h1">Make<br /><em>The</em><br />Switch.</h1>
          <div className="hero-actions">
            <Link href="/subscribe" className="btn btn-gold">
              Stream Exclusive
              <ArrowRight className="icon-sm" />
            </Link>
            <Link href="/music" className="btn btn-outline">
              <PlayCircle className="icon-sm" />
              Preview Tracks
            </Link>
            <span className="hero-date"><strong>{epDate ? formatDate(epDate) : 'May 22, 2025'}</strong> · poshbugati.com</span>
          </div>
        </div>
        <a className="scroll-hint" href="#stream-bar">
          <div className="scroll-line" />
          <span>Scroll</span>
        </a>
      </section>

      <div className="stream-bar" id="stream-bar">
        <span className="stream-label">Available on</span>
        <div className="stream-platforms">
          {streamingLinks.map((link) => (
            <a
              key={link.id}
              className="stream-link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="sdot" style={{ background: PLATFORM_COLORS[link.platform] ?? 'var(--text-muted)' }} />
              {link.platform}
            </a>
          ))}
          <Link href="/subscribe" className={`stream-link ${styles.exclusiveStreamLink}`}>
            <div className="sdot" style={{ background: 'var(--gold)' }} />poshbugati.com — Exclusive
          </Link>
        </div>
      </div>

      <section className="section-pad">
        <div className="section-wrap">
          <div className={styles.sectionHeaderRow}>
            <div>
              <div className="section-label">Latest Releases</div>
              <h2 className="section-title">New <em>Music</em></h2>
            </div>
            <Link href="/music" className="btn btn-outline btn-sm">All Music →</Link>
          </div>
          <div className="featured-grid">
            {releases.map((release) => (
              <Link key={release.id} href="/music" className="feat-card">
                <div
                  className="feat-img img-placeholder"
                  style={{
                    backgroundImage: getMediaUrl(release.coverImage) ? `url('${getMediaUrl(release.coverImage)}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 'inherit',
                  }}
                />
                <div className="feat-body">
                  <div className="feat-tag">{release.type} · {formatDate(release.releaseDate)}</div>
                  <div className="feat-title">{release.title}</div>
                  <div className="feat-excerpt">{release.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="quote-band">
        <blockquote>
          &ldquo;Afro country isn&apos;t a trend — it&apos;s a moved-into-new-ground sound.&rdquo;
          <cite>— {artist?.name || 'Poshbugati'}</cite>
        </blockquote>
      </div>

      <section className="section-pad">
        <div className="section-wrap">
          <div className={styles.latestRow}>
            <div>
              <div className="section-label">Latest</div>
              <h2 className="section-title">From the <em>Journal</em></h2>
            </div>
            <Link href="/blog" className="btn btn-outline btn-sm">All Posts →</Link>
          </div>
          <div className="news-strip">
            {blogPosts.map((post) => (
              <Link key={post.id} href="/blog" className="news-item">
                <span className="news-date">{formatDate(post.publishedDate)}</span>
                <span className="news-title">{post.title}</span>
                <span className="news-cat">{post.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`section-pad ${styles.subCtaSection}`}>
        <div className="section-wrap">
          <div className="sub-cta">
            <h3>Join the <em>inner circle.</em></h3>
            <p>Pre-save access, liner notes, merch bundles, and early stream — before anyone else hears a thing.</p>
            <HomeSubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
