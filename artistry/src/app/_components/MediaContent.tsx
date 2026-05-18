'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, PenTool, Archive, Download, Music, Eye, X } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';
import type { MediaGallery } from '@/payload-types';
import styles from './MediaContent.module.css';

type Tab = 'photos' | 'videos' | 'press' | 'epk';

interface PageMeta {
  totalPages: number;
  totalDocs: number;
  page: number;
}

interface Props {
  photos: MediaGallery[];
  photosMeta: PageMeta;
  videos: MediaGallery[];
  videosMeta: PageMeta;
  pressQuotes: MediaGallery[];
}

const PAGE_LIMIT = 12;

async function fetchGalleryPage(type: string, page: number): Promise<{ docs: MediaGallery[]; totalPages: number; totalDocs: number; page: number }> {
  const url = `/api/gallery?type=${encodeURIComponent(type)}&page=${page}&limit=${PAGE_LIMIT}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch gallery');
  return res.json();
}

function getGalleryImageUrl(item: MediaGallery): string {
  const img = item.file || item.thumbnail;
  return getMediaUrl(img);
}

function getFullImageUrl(item: MediaGallery): string {
  const img = item.file || item.thumbnail;
  if (!img || typeof img === 'number') return '';
  // Prefer the original full-size URL over resized variants
  return (img as { url?: string | null }).url
    ? getMediaUrl({ url: (img as { url?: string | null }).url })
    : getMediaUrl(img, 'large');
}

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, '_blank');
  }
}

interface LightboxPhoto {
  url: string;
  fullUrl: string;
  title: string;
}

function Lightbox({ photo, onClose }: { photo: LightboxPhoto; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.lightboxBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <img src={photo.fullUrl || photo.url} alt={photo.title} className={styles.lightboxImg} />
        <div className={styles.lightboxActions}>
          {photo.title && <span className={styles.lightboxTitle}>{photo.title}</span>}
          <button
            className={`${styles.overlayBtn} ${styles.overlayBtnFilled}`}
            onClick={() => downloadImage(photo.fullUrl || photo.url, photo.title || 'photo')}
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

interface GalleryPaginationProps {
  meta: PageMeta;
  loading: boolean;
  onPage: (p: number) => void;
}

function GalleryPagination({ meta, loading, onPage }: GalleryPaginationProps) {
  if (meta.totalPages <= 1) return null;
  return (
    <div>
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          disabled={meta.page <= 1 || loading}
          onClick={() => onPage(meta.page - 1)}
          aria-label="Previous page"
        >
          ←
        </button>
        {pageRange(meta.page, meta.totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className={styles.pageDots}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn}${meta.page === p ? ` ${styles.pageBtnActive}` : ''}`}
              onClick={() => onPage(p)}
              disabled={loading || meta.page === p}
              aria-label={`Page ${p}`}
              aria-current={meta.page === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          className={styles.pageBtn}
          disabled={meta.page >= meta.totalPages || loading}
          onClick={() => onPage(meta.page + 1)}
          aria-label="Next page"
        >
          →
        </button>
      </div>
      <p className={styles.pageMeta}>
        Page {meta.page} of {meta.totalPages} · {meta.totalDocs} items
      </p>
    </div>
  );
}

export default function MediaContent({ photos: initialPhotos, photosMeta: initialPhotosMeta, videos: initialVideos, videosMeta: initialVideosMeta, pressQuotes }: Props) {
  const [tab, setTab] = useState<Tab>('photos');
  const [copyLabel, setCopyLabel] = useState<Record<string, string>>({ short: 'Copy Text', one: 'Copy Text' });
  const [lightboxPhoto, setLightboxPhoto] = useState<LightboxPhoto | null>(null);

  const [photos, setPhotos] = useState<MediaGallery[]>(initialPhotos);
  const [photosMeta, setPhotosMeta] = useState<PageMeta>(initialPhotosMeta);
  const [photosLoading, setPhotosLoading] = useState(false);

  const [videos, setVideos] = useState<MediaGallery[]>(initialVideos);
  const [videosMeta, setVideosMeta] = useState<PageMeta>(initialVideosMeta);
  const [videosLoading, setVideosLoading] = useState(false);

  const goToPhotosPage = useCallback(async (page: number) => {
    setPhotosLoading(true);
    try {
      const res = await fetchGalleryPage('Photo', page);
      setPhotos(res.docs);
      setPhotosMeta({ totalPages: res.totalPages, totalDocs: res.totalDocs, page: res.page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  const goToVideosPage = useCallback(async (page: number) => {
    setVideosLoading(true);
    try {
      const res = await fetchGalleryPage('Video', page);
      setVideos(res.docs);
      setVideosMeta({ totalPages: res.totalPages, totalDocs: res.totalDocs, page: res.page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setVideosLoading(false);
    }
  }, []);

  const bios = {
    short: 'Poshbugati is an Afro country artist and the originator of a sound that fuses West African Afrobeat rhythms with country music storytelling. His debut EP, The Switch, releases exclusively on poshbugati.com. Five tracks. One new genre. Zero compromises.',
    one: 'Poshbugati — Afro country artist. Creator of The Switch EP. Where sun-kissed Afrobeat rhythms meet heartfelt country storytelling.',
  };

  const copyBio = (type: 'short' | 'one') => {
    navigator.clipboard.writeText(bios[type]).then(() => {
      setCopyLabel(prev => ({ ...prev, [type]: '✓ Copied!' }));
      setTimeout(() => setCopyLabel(prev => ({ ...prev, [type]: 'Copy Text' })), 2000);
    });
  };

  return (
    <>
      <div className={styles.tabsBarWrap}>
        <div className="media-tabs">
          {(['photos', 'videos', 'press', 'epk'] as Tab[]).map(t => (
            <button
              key={t}
              className={`media-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'photos' ? 'Photos' : t === 'videos' ? 'Videos' : t === 'press' ? 'Press Coverage' : 'Press Kit'}
            </button>
          ))}
        </div>
      </div>

      <section className="section-pad">
        <div className="section-wrap">

          {tab === 'photos' && (
            <div style={{ opacity: photosLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              <div className={styles.photoHeader}>
                <div>
                  <div className="section-label">Editorial Photos</div>
                  <h2 className="section-title">Photo <em>Gallery</em></h2>
                </div>
                <a href="#" className="btn btn-outline btn-sm">Download All (ZIP)</a>
              </div>
              <div className="photo-grid">
                {photos.map((item) => {
                  const thumbUrl = getGalleryImageUrl(item);
                  const fullUrl = getFullImageUrl(item);
                  const title = item.title ?? '';
                  return (
                    <div key={item.id} className={`photo-item ${styles.photoItem}`}>
                      <div
                        className="img-placeholder"
                        style={{
                          backgroundImage: thumbUrl ? `url('${thumbUrl}')` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                      <div className={styles.photoOverlay}>
                        <button
                          className={`${styles.overlayBtn} ${styles.overlayBtnOutline}`}
                          onClick={() => setLightboxPhoto({ url: thumbUrl, fullUrl, title })}
                          aria-label={`Preview ${title}`}
                        >
                          <Eye size={13} />
                          Preview
                        </button>
                        <button
                          className={`${styles.overlayBtn} ${styles.overlayBtnFilled}`}
                          onClick={() => downloadImage(fullUrl || thumbUrl, title || `photo-${item.id}`)}
                          aria-label={`Download ${title}`}
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <GalleryPagination meta={photosMeta} loading={photosLoading} onPage={goToPhotosPage} />
              <p className={styles.photoAttribution}>
                All photos © 2025 Poshbugati. Cleared for press and editorial use with attribution. For commercial licensing, <Link href="/contact" className={styles.photoAttributionLink}>contact us</Link>.
              </p>
            </div>
          )}

          {tab === 'videos' && (
            <div style={{ opacity: videosLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              <div className="section-label">Video Content</div>
              <h2 className={`section-title ${styles.sectionMb40}`}>Watch &amp; <em>Share</em></h2>
              <div className="videos-grid">
                {videos.map((v) => (
                  <div key={v.id} className="video-card">
                    <div
                      className="video-thumb img-placeholder"
                      style={{
                        backgroundImage: getGalleryImageUrl(v) ? `url('${getGalleryImageUrl(v)}')` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="play-overlay">
                        <div className="play-btn">▶</div>
                      </div>
                    </div>
                    <div className="video-body">
                      <div className="video-title">{v.title}</div>
                      {v.videoUrl && (
                        <a href={v.videoUrl} target="_blank" rel="noreferrer" className="video-meta">Watch →</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <GalleryPagination meta={videosMeta} loading={videosLoading} onPage={goToVideosPage} />
            </div>
          )}

          {tab === 'press' && (
            <div>
              <div className="section-label">Coverage</div>
              <h2 className={`section-title ${styles.sectionMb40}`}>In the <em>Press</em></h2>
              <div className="press-grid">
                {pressQuotes.map((p) => (
                  <div key={p.id} className="press-item">
                    <div className="press-pub">{p.publication}{p.author ? ` · ${p.author}` : ''}</div>
                    <div className="press-quote">&ldquo;{p.quote ? 'Quote from CMS' : ''}&rdquo;</div>
                    <a href="#" className="press-link">Read full article →</a>
                  </div>
                ))}
              </div>
              <div className={styles.pressEnquiryBlock}>
                <div>
                  <div className={styles.pressEnquiryLabel}>Press enquiries</div>
                  <div className={styles.pressEnquiryDesc}>For interview requests, review copies, and press passes:</div>
                </div>
                <a href="mailto:press@poshbugati.com" className={styles.pressEnquiryEmail}>press@poshbugati.com</a>
              </div>
            </div>
          )}

          {tab === 'epk' && (
            <div className="epk-section">
              <div>
                <div className="section-label">Downloads</div>
                <h2 className={`section-title ${styles.sectionMb32}`}>Press <em>Kit</em></h2>
                <div className="epk-downloads">
                  {[
                    { icon: <FileText className="icon-lg dl-icon" />, name: 'Official Artist Bio (Short)', size: 'PDF · 120 words · English' },
                    { icon: <FileText className="icon-lg dl-icon" />, name: 'Official Artist Bio (Long)', size: 'PDF · 400 words · English' },
                    { icon: <ImageIcon className="icon-lg dl-icon" />, name: 'Press Photos — Hi-Res Pack', size: 'ZIP · 7 photos · 300dpi' },
                    { icon: <PenTool className="icon-lg dl-icon" />, name: 'Logo & Brand Assets', size: 'ZIP · SVG + PNG · All variants' },
                    { icon: <Music className="icon-lg dl-icon" />, name: 'The Switch EP — Press Copy', size: 'WAV · 5 tracks · Watermarked' },
                    { icon: <Archive className="icon-lg dl-icon" />, name: 'Complete Press Kit (All Assets)', size: 'ZIP · 180MB · All of the above' },
                  ].map((item, i) => (
                    <a key={i} href="#" className="dl-item">
                      {item.icon}
                      <div className="dl-info">
                        <div className="dl-name">{item.name}</div>
                        <div className="dl-size">{item.size}</div>
                      </div>
                      <Download className="icon-md dl-arrow" />
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <div className="section-label">Official Bio</div>
                <h3 className={styles.bioHeading}>
                  Copy-ready <em className={styles.bioHeadingEm}>bios</em>
                </h3>
                {(['short', 'one'] as const).map(type => (
                  <div key={type} className="bio-block">
                    <h3>{type === 'short' ? 'Short Bio (120 words)' : 'One-line Bio'}</h3>
                    <p>{bios[type]}</p>
                    <button className="copy-btn" onClick={() => copyBio(type)}>{copyLabel[type]}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
      )}
    </>
  );
}
