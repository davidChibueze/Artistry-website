import type { Metadata } from 'next';
import Link from 'next/link';
import MusicPlayer from '../../_components/MusicPlayer';
import ReleaseDescription from '../../_components/ReleaseDescription';
import { getReleases, getSiteSettings, getArtistProfile, getMediaUrl } from '@/lib/api';
import { detectInitialCurrency } from '@/lib/currency-detect';
import { formatMoney, priceFor } from '@/lib/money';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Music',
    description: 'Every release, every story. From debut singles to The Switch EP — the full sonic journey of Afro country.',
  };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function MusicPage() {
  const [releasesRes, settings, artist] = await Promise.all([
    getReleases().catch(() => ({ docs: [], totalDocs: 0 })),
    getSiteSettings().catch(() => null),
    getArtistProfile().catch(() => null),
  ]);
  const currency = await detectInitialCurrency();
  const releases = releasesRes.docs;
  const heroId = typeof settings?.heroRelease === 'number' ? settings.heroRelease : (settings?.heroRelease as { id?: number })?.id;
  const featured = heroId
    ? releases.find(r => r.id === heroId) ?? releases.find(r => r.featured) ?? releases[0]
    : releases.find(r => r.featured) ?? releases[0];

  const cmsTracks = featured?.tracks?.map(t => ({
    id: t.id,
    n: t.number,
    name: t.title,
    sub: t.subtitle || `Afro Country`,
    dur: t.duration,
    badge: t.badge || '',
    previewUrl: t.previewUrl || getMediaUrl(t.audioFile),
    priceUSD: t.priceUSD,
    priceNGN: t.priceNGN,
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
                    <Link href={`/music/${featured.slug}`} className="btn btn-outline">Full EP Details</Link>
                  </div>
                  <MusicPlayer
                    releaseId={featured.id}
                    tracks={cmsTracks}
                    releaseTitle={featured.title}
                    releaseType={featured.type}
                    streamUrl={featured.streamUrl}
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
            {releases.map((release) => {
              const streamHref = release.streamUrl ?? null;
              const detailHref = `/music/${release.slug}`;
              const hasBuy = (release.distributionTiers?.length ?? 0) > 0;
              return (
                <div key={release.id} className={`release-card ${styles.cardLinkable}`}>
                  <Link
                    href={detailHref}
                    className={styles.cardOverlay}
                    aria-label={`Open ${release.title}`}
                  />
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
                    {release.description && (
                      <ReleaseDescription
                        title={release.title}
                        releaseType={release.type}
                        description={release.description}
                        className="release-desc"
                      />
                    )}
                    {release.featured && (
                      <div className="release-tags">
                        <span className="badge badge-gold">Latest</span>
                      </div>
                    )}
                    <div className={styles.releasePlatforms}>
                      {streamHref && (
                        <a
                          href={streamHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.releasePlatformBtn}
                        >
                          <span
                            className={styles.releasePlatformDot}
                            style={{ background: 'var(--gold)' }}
                          />
                          Stream
                        </a>
                      )}
                      {hasBuy && (
                        <Link href={detailHref} className={`${styles.releasePlatformBtn} ${styles.releaseBuyBtn}`}>
                          Buy · {formatMoney(priceFor(release.distributionTiers![0], currency), currency)}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.platformsWrap}>
            <div className="section-label">Stream & Save</div>
            <h3 className={`section-title ${styles.platformsTitle}`}>Find the <em>music</em> everywhere</h3>
            <div className="platform-grid">
              {artist?.socialLinks?.spotify
                ? <a className="platform-btn" href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer"><div className="p-dot" style={{ background: '#1DB954' }} />Spotify</a>
                : <Link className="platform-btn" href="https://open.spotify.com/artist/4pXLT4UxQjOnIF2i9ShM3J"><div className="p-dot" style={{ background: '#1DB954' }} />Spotify</Link>
              }
              {artist?.socialLinks?.appleMusic
                ? <a className="platform-btn" href={artist.socialLinks.appleMusic} target="_blank" rel="noopener noreferrer"><div className="p-dot" style={{ background: '#FC3C44' }} />Apple Music</a>
                : <Link className="platform-btn" href="https://music.apple.com/us/artist/poshbugati/1584769972"><div className="p-dot" style={{ background: '#FC3C44' }} />Apple Music</Link>
              }
              {artist?.socialLinks?.youtube
                ? <a className="platform-btn" href={artist.socialLinks.youtube} target="_blank" rel="noopener noreferrer"><div className="p-dot" style={{ background: '#FF0000' }} />YouTube Music</a>
                : <Link className="platform-btn" href="https://www.youtube.com/channel/UC995IfxE4P9cJ6DXvlFQWtA"><div className="p-dot" style={{ background: '#FF0000' }} />YouTube Music</Link>
              }
              <Link href="/subscribe" className={`platform-btn ${styles.exclusivePlatform}`}><div className="p-dot" style={{ background: 'var(--gold)' }} />poshbugati.com</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
