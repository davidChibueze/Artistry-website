'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, PenTool, Archive, Download, Music } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';
import type { MediaGallery } from '@/payload-types';
import styles from './MediaContent.module.css';

type Tab = 'photos' | 'videos' | 'press' | 'epk';

interface Props {
  photos: MediaGallery[];
  videos: MediaGallery[];
  pressQuotes: MediaGallery[];
}

function getGalleryImageUrl(item: MediaGallery): string {
  const img = item.file || item.thumbnail;
  return getMediaUrl(img);
}

export default function MediaContent({ photos, videos, pressQuotes }: Props) {
  const [tab, setTab] = useState<Tab>('photos');
  const [copyLabel, setCopyLabel] = useState<Record<string, string>>({ short: 'Copy Text', one: 'Copy Text' });

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
            <div>
              <div className={styles.photoHeader}>
                <div>
                  <div className="section-label">Editorial Photos</div>
                  <h2 className="section-title">Photo <em>Gallery</em></h2>
                </div>
                <a href="#" className="btn btn-outline btn-sm">Download All (ZIP)</a>
              </div>
              <div className="photo-grid">
                {photos.map((item) => (
                  <div key={item.id} className="photo-item">
                    <div
                      className="img-placeholder"
                      style={{
                        backgroundImage: getGalleryImageUrl(item) ? `url('${getGalleryImageUrl(item)}')` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className={styles.photoAttribution}>
                All photos © 2025 Poshbugati. Cleared for press and editorial use with attribution. For commercial licensing, <Link href="/contact" className={styles.photoAttributionLink}>contact us</Link>.
              </p>
            </div>
          )}

          {tab === 'videos' && (
            <div>
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
    </>
  );
}
