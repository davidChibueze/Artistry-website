import type { Metadata } from 'next';
import Link from 'next/link';
import { getPodcastEpisodes, getPodcastStats } from '@/lib/api';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Podcast',
  description: "Between Two Sounds — the podcast that lives at the intersection of Afrobeat and country. Conversations, stories, and the making of a new genre.",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function PodcastPage() {
  const [episodesRes, stats] = await Promise.all([
    getPodcastEpisodes().catch(() => ({ docs: [], totalDocs: 0 })),
    getPodcastStats().catch(() => null),
  ]);

  const episodes = episodesRes.docs;

  return (
    <>
      <div className="pod-hero">
        <div className="pod-hero-left">
          <div className="page-kicker">Audio Series</div>
          <h1 className="page-title">Between<br /><em>Two Sounds</em></h1>
          <p className="page-sub">The podcast that lives at the intersection of Afrobeat and country — conversations, stories, and the making of a new genre.</p>
          <div className="pod-platforms">
            <a href="#" className="pod-plat"><div className="sdot" style={{ background: '#8B5CF6' }} />Spotify</a>
            <a href="#" className="pod-plat"><div className="sdot" style={{ background: '#B854F9' }} />Apple Podcasts</a>
            <a href="#" className="pod-plat"><div className="sdot" style={{ background: '#1DA0F2' }} />Google Podcasts</a>
            <a href="#" className="pod-plat"><div className="sdot" style={{ background: '#FF7700' }} />RSS Feed</a>
          </div>
        </div>
        <div className="pod-hero-right">
          <div className="pod-art">
            <div className="pod-art-label">Podcast</div>
            <div className="pod-art-title">Between<br />Two<br />Sounds</div>
            <div className="pod-art-sub">by poshbugati</div>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="section-wrap">
          <div className={styles.episodesHeader}>
            <div>
              <div className="section-label">Episodes</div>
              <h2 className="section-title">Latest <em>Episodes</em></h2>
            </div>
          </div>

          <div className="ep-list">
            {episodes.map((e, i) => (
              <div key={e.id} className={`ep-card${i === 0 ? ' featured' : ''}`}>
                <div className="ep-num-block">
                  <div className="ep-num">{String(e.episodeNumber).padStart(2, '0')}</div>
                  <div className="ep-num-label">EP</div>
                </div>
                <div className="ep-body">
                  <div className="ep-title">
                    {e.title}
                    {i === 0 && <span className={`badge badge-gold ${styles.badgeMl}`}>Latest</span>}
                  </div>
                  <div className="ep-desc">{e.description ? 'Listen to this episode' : ''}</div>
                  <div className="ep-meta">
                    <span className="ep-date">{formatDate(e.publishDate)}</span>
                    {e.duration && <span className="ep-dur">· {e.duration}</span>}
                    {e.tags?.slice(0, 2).map(t => <span key={t.tag} className="badge badge-teal">{t.tag}</span>)}
                  </div>
                </div>
                <div className="ep-play">▶</div>
              </div>
            ))}
          </div>

          <div className="show-about">
            <div>
              <h3>About <em>the show</em></h3>
              <p>{stats?.description || '\u003Cstrong\u003EBetween Two Sounds\u003C/strong\u003E is the podcast by Poshbugati that asks: what happens at the edge of a genre? Hosted by the artist himself, each episode is part conversation, part exploration — pulling apart the threads of Afrobeat and country music to see where they already share the same fabric.'}</p>
              <p>New episodes drop every other Thursday. Subscribe on your platform of choice, or listen right here.</p>
              <div className={styles.showActions}>
                <a href="#" className="btn btn-gold btn-sm">Subscribe on Spotify</a>
                <a href="#" className="btn btn-outline btn-sm">Apple Podcasts</a>
              </div>
            </div>
            <div>
              <div className="show-stats-grid">
                {[
                  { n: String(stats?.totalEpisodes ?? episodes.length), l: 'Episodes' },
                  { n: stats?.totalListeners ? `${(stats.totalListeners / 1000).toFixed(0)}k+` : '40k+', l: 'Listeners' },
                  { n: '2x', l: 'Monthly' },
                  { n: `${stats?.averageRating ?? '5'}★`, l: 'Avg Rating' },
                ].map(({ n, l }) => (
                  <div key={l} className="show-stat">
                    <div className="show-stat-n">{n}</div>
                    <div className="show-stat-l">{l}</div>
                  </div>
                ))}
              </div>
              <div className={styles.pitchBox}>
                <div className={`section-label ${styles.pitchLabel}`}>Guest on the show?</div>
                <p className={styles.pitchDesc}>
                  We&apos;re always looking for artists, producers, and cultural storytellers who live at the crossroads of genres. Pitch your story.
                </p>
                <Link href="/contact" className="btn btn-outline btn-sm">Pitch to the Show</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
