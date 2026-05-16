import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import HomeSubscribeForm from '../_components/HomeSubscribeForm';
import HeroSocials from '../_components/HeroSocials';
import MarqueeCarousel from '../_components/MarqueeCarousel';
import MerchProductCard from '../_components/MerchProductCard';
import { getArtistProfile, getReleases, getTourShows, getBlogPosts, getSiteSettings, getMerchProducts, getMediaUrl } from '@/lib/api';
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
  const [artist, releasesRes, showsRes, blogRes, settings, featuredMerchRes, anyMerchRes] = await Promise.all([
    getArtistProfile().catch(() => null),
    getReleases({ featured: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getTourShows({ upcoming: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getBlogPosts({ published: true, limit: 4 }).catch(() => ({ docs: [], totalDocs: 0 })),
    getSiteSettings().catch(() => null),
    getMerchProducts({ inStock: true, featured: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getMerchProducts({ inStock: true }).catch(() => ({ docs: [], totalDocs: 0 })),
  ]);

  const releases = releasesRes.docs;
  const shows = showsRes.docs.slice(0, 3);
  const blogPosts = blogRes.docs;
  const epDate = settings?.epReleaseDate;
  const featured = releasesRes.docs[0];
  const merchProducts = featuredMerchRes.docs.length > 0 ? featuredMerchRes.docs : anyMerchRes.docs;

  const streamUrl = featured?.streamUrl ?? null;

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
          <HeroSocials socials={artist?.socialLinks} />
        </div>
        <a className="scroll-hint" href="#stream-bar">
          <div className="scroll-line" />
          <span>Scroll</span>
        </a>
      </section>

      <div className="stream-bar" id="stream-bar">
        <span className="stream-label">Available on</span>
        <div className="stream-platforms">
          {streamUrl && (
            <a
              className="stream-link"
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="sdot" style={{ background: 'var(--gold)' }} />
              Stream
            </a>
          )}
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
          <MarqueeCarousel itemWidth={360} gap={24} duration={45}>
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
          </MarqueeCarousel>
        </div>
      </section>

      <div className="quote-band">
        <blockquote>
          &ldquo;Afro country isn&apos;t a trend — it&apos;s a moved-into-new-ground sound.&rdquo;
          <cite>— {artist?.name || 'Poshbugati'}</cite>
        </blockquote>
      </div>

      {merchProducts.length > 0 && (
        <section className="section-pad">
          <div className="section-wrap">
            <div className={styles.sectionHeaderRow}>
              <div>
                <div className="section-label">Official Store</div>
                <h2 className="section-title">Featured <em>Merch</em></h2>
              </div>
              <Link href="/merch" className="btn btn-outline btn-sm">All Merch →</Link>
            </div>
            <MarqueeCarousel itemWidth={320} gap={28} duration={50}>
              {merchProducts.map((product) => (
                <MerchProductCard key={product.id} product={product} />
              ))}
            </MarqueeCarousel>
          </div>
        </section>
      )}

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
