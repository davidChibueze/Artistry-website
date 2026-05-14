import type { Metadata } from 'next';
import Link from 'next/link';
import MusicPlayer from '../../_components/MusicPlayer';
import { getReleases, getMediaUrl } from '@/lib/api';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Music',
    description: 'Every release, every story. From debut singles to The Switch EP — the full sonic journey of Afro country.',
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function MusicPage() {
  const releasesRes = await getReleases().catch(() => ({ docs: [], totalDocs: 0 }));
  const releases = releasesRes.docs;
  const featured = releases.find(r => r.featured) ?? releases[0];

  const cmsTracks = featured?.tracks?.map(t => ({
    n: t.number,
    name: t.title,
    sub: t.subtitle || `Afro Country`,
    dur: t.duration,
    badge: t.badge || '',
    previewUrl: t.previewUrl || '',
  })) ?? [];

  return (
    <>
      <div className="music-hero-bg">
        <div className="page-kicker">Discography</div>
        <h1 className="page-title">The <em>Music</em></h1>
        <p className="page-sub">Every release, every story. From debut singles to The Switch EP — the full sonic journey of Afro country.</p>
      </div>

      <section className="section-pad">
        <div className="section-wrap">
          {featured && (
            <>
              <div className="ep-featured">
                <div
                  className="ep-art-big img-placeholder"
                  style={{
                    backgroundImage: getMediaUrl(featured.coverImage) ? `url('${getMediaUrl(featured.coverImage)}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 'inherit',
                  }}
                />
                <div>
                  <div className="ep-featured-tag">Latest Release · {featured.type}</div>
                  <h2 className="ep-featured-title">{featured.title.split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : `${w} `)}</h2>
                  <p className="ep-featured-desc">
                    {featured.description || `${featured.tracks?.length || 0} tracks. Two worlds. The Switch is not a genre experiment — it is a declaration. Exclusively on poshbugati.com.`}
                  </p>
                  <div className="ep-featured-actions">
                    <Link href="/subscribe" className="btn btn-gold">Stream Exclusive</Link>
                    <Link href="/music" className="btn btn-outline">Full EP Details</Link>
                  </div>
                  <MusicPlayer
                    tracks={cmsTracks}
                    releaseTitle={featured.title}
                    releaseType={featured.type}
                    streamingLinks={featured.streamingLinks}
                    distributionTiers={featured.distributionTiers}
                  />
                </div>
              </div>

              <hr className={`divider ${styles.dividerSpaced}`} />
            </>
          )}

          <div className="section-label">All Releases</div>
          <h2 className="section-title">Discography</h2>
          <div className="releases-grid">
            {releases.map((release) => (
              <Link key={release.id} href="/music" className="release-card">
                <div
                  className="release-art img-placeholder"
                  style={{
                    backgroundImage: getMediaUrl(release.coverImage) ? `url('${getMediaUrl(release.coverImage)}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 'inherit',
                  }}
                />
                <div className="release-body">
                  <div className="release-meta">{release.type} · {formatDate(release.releaseDate)} · {release.tracks?.length || 0} Tracks</div>
                  <div className="release-name">{release.title}</div>
                  <div className="release-desc">{release.description}</div>
                  <div className="release-tags">
                    {release.featured && <span className="badge badge-gold">Latest</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.platformsWrap}>
            <div className="section-label">Stream & Save</div>
            <h3 className={`section-title ${styles.platformsTitle}`}>Find the <em>music</em> everywhere</h3>
            <div className="platform-grid">
              <Link className="platform-btn" href="/subscribe"><div className="p-dot" style={{ background: '#1DB954' }} />Spotify</Link>
              <Link className="platform-btn" href="/subscribe"><div className="p-dot" style={{ background: '#FC3C44' }} />Apple Music</Link>
              <Link className="platform-btn" href="/subscribe"><div className="p-dot" style={{ background: '#FF0000' }} />YouTube Music</Link>
              <Link href="/subscribe" className={`platform-btn ${styles.exclusivePlatform}`}><div className="p-dot" style={{ background: 'var(--gold)' }} />poshbugati.com</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
