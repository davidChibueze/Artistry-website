import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import MusicPlayer from '../../../_components/MusicPlayer'
import { getReleaseBySlug, getMediaUrl } from '@/lib/api'

import styles from './page.module.css'

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const release = await getReleaseBySlug(slug).catch(() => null)
  if (!release) return { title: 'Release' }

  const cover = getMediaUrl(release.coverImage)
  return {
    title: release.title,
    description:
      release.description ||
      `${release.type ?? 'Release'} by Poshbugati — ${release.tracks?.length ?? 0} tracks.`,
    openGraph: {
      title: release.title,
      description: release.description ?? undefined,
      images: cover ? [{ url: cover }] : undefined,
    },
  }
}

export default async function ReleaseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const release = await getReleaseBySlug(slug).catch(() => null)
  if (!release) notFound()

  const cover = getMediaUrl(release.coverImage)
  const tracks =
    release.tracks?.map((t) => ({
      id: t.id,
      n: t.number,
      name: t.title,
      sub: t.subtitle || 'Afro Country',
      dur: t.duration,
      badge: t.badge || '',
      previewUrl: t.previewUrl || getMediaUrl(t.audioFile),
      priceUSD: t.priceUSD,
      priceNGN: t.priceNGN,
    })) ?? []

  return (
    <div className={styles.wrap}>
      <Link href="/music" className={styles.back}>
        ← All releases
      </Link>

      <div className={styles.hero}>
        <div
          className={styles.cover}
          style={cover ? { backgroundImage: `url('${cover}')` } : undefined}
          aria-hidden="true"
        />
        <div className={styles.meta}>
          <div className={styles.kicker}>
            {release.type ?? 'Release'}
            {release.releaseDate ? ` · ${formatDate(release.releaseDate)}` : ''}
            {release.tracks?.length ? ` · ${release.tracks.length} tracks` : ''}
          </div>
          <h1 className={styles.title}>{release.title}</h1>
          {release.description && <p className={styles.description}>{release.description}</p>}
          <div className={styles.heroActions}>
            {release.streamUrl && (
              <a
                href={release.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm"
              >
                Stream
              </a>
            )}
            <Link href="/subscribe" className="btn btn-outline btn-sm">
              Stream Exclusive
            </Link>
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      <MusicPlayer
        releaseId={release.id}
        tracks={tracks}
        releaseTitle={release.title}
        releaseType={release.type}
        streamUrl={release.streamUrl}
        distributionTiers={release.distributionTiers}
      />
    </div>
  )
}
