'use client';

import { useState } from 'react';
import Link from 'next/link';
import { initializePayment } from '@/lib/api';
import styles from './DistributionModal.module.css';
import type { Track } from './MusicPlayer';

interface StreamingLink {
  platform: string;
  url: string;
}

interface DistributionTier {
  label: string;
  description: string;
  price: number;
  currency: string;
}

interface Props {
  track: Track;
  releaseTitle: string;
  releaseType: string;
  trackCount: number;
  streamingLinks?: StreamingLink[];
  distributionTiers?: DistributionTier[];
  onClose: () => void;
  onPreview: () => void;
  isPreviewPlaying: boolean;
}

const DEFAULT_PLATFORMS = [
  { id: 'spotify', name: 'Spotify', color: '#1DB954', href: '#' },
  { id: 'apple', name: 'Apple Music', color: '#FC3C44', href: '#' },
  { id: 'youtube', name: 'YouTube Music', color: '#FF0000', href: '#' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF7700', href: '#' },
];

type Stage = 'options' | 'payment' | 'success';

export default function DistributionModal({
  track,
  releaseTitle,
  releaseType,
  trackCount,
  streamingLinks,
  distributionTiers,
  onClose,
  onPreview,
  isPreviewPlaying,
}: Props) {
  const [selectedTrackTier, setSelectedTrackTier] = useState<number | null>(null);
  const [selectedEpTier, setSelectedEpTier] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>('options');
  const [email, setEmail] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);

  const trackTiers = distributionTiers?.map((t, i) => ({ ...t, idx: i })) ?? [];
  const epTiers = distributionTiers?.map((t, i) => ({ ...t, idx: i })) ?? [];

  const selectedTier =
    (selectedTrackTier !== null && trackTiers[selectedTrackTier]) ||
    (selectedEpTier !== null && epTiers[selectedEpTier]) ||
    null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCheckout = async () => {
    if (!selectedTier) return;
    const amount = Math.round(selectedTier.price * 100);
    const currency = selectedTier.currency || 'USD';
    const reference = `PB-${Date.now()}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    setRedirecting(true);
    try {
      const res = await initializePayment({
        amount,
        email: email || 'customer@example.com',
        currency,
        reference,
        callbackUrl: `${siteUrl}/payment/success`,
        narration: `${releaseTitle} ${releaseType} — ${selectedTier.label}`,
      });
      window.location.href = res.data.authorizationUrl;
    } catch {
      setRedirecting(false);
    }
  };

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
  };

  const platforms = streamingLinks
    ? streamingLinks.map((link, i) => ({
        id: link.platform.toLowerCase().replace(/\s+/g, '-'),
        name: link.platform,
        color: ['#1DB954', '#FC3C44', '#FF0000', '#FF7700', '#8B5CF6'][i % 5],
        href: link.url,
      }))
    : DEFAULT_PLATFORMS;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.header}>
          <div className={styles.epArtMini}>
            <div className={styles.epArtText}>{releaseTitle.toUpperCase().split(' ').slice(0, 2).join('<br/>')}</div>
          </div>
          <div className={styles.trackMeta}>
            <div className={styles.trackTitle}>{track.name}</div>
            <div className={styles.trackDetail}>
              {releaseTitle} {releaseType} · Track {track.n} of {trackCount} · {track.dur}
            </div>
            {track.badge && <span className="badge badge-gold">{track.badge}</span>}
            <button
              className={`${styles.headerPreviewBtn}${isPreviewPlaying ? ` ${styles.headerPreviewBtnActive}` : ''}`}
              onClick={onPreview}
            >
              {isPreviewPlaying ? '⏸ Pause Preview' : '▶ Play 30s Preview'}
            </button>
          </div>
        </div>

        {stage === 'options' && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Stream for Free</div>
              <div className={styles.platformRow}>
                {platforms.map(p => (
                  <a key={p.id} href={p.href} className={styles.platBtn} target="_blank" rel="noreferrer">
                    <span className={styles.platDot} style={{ background: p.color }} />
                    {p.name}
                  </a>
                ))}
                <Link href="/subscribe" className={`${styles.platBtn} ${styles.platBtnExclusive}`}>
                  <span className={styles.platDot} style={{ background: 'var(--gold)' }} />
                  poshbugati.com — Exclusive
                </Link>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>Download This Track</div>
              <div className={styles.tierList}>
                {trackTiers.map((tier, i) => (
                  <button
                    key={i}
                    className={`${styles.tierItem}${selectedTrackTier === i ? ` ${styles.tierSelected}` : ''}`}
                    onClick={() => { setSelectedTrackTier(i); setSelectedEpTier(null); }}
                  >
                    <div className={styles.tierRadio}>
                      <div className={styles.tierRadioInner} />
                    </div>
                    <div className={styles.tierInfo}>
                      <div className={styles.tierLabel}>{tier.label}</div>
                      <div className={styles.tierDesc}>{tier.description}</div>
                    </div>
                    <div className={styles.tierPrice}>
                      {tier.currency === 'NGN' ? '₦' : '$'}{tier.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionLabel}>Or Get the Full {releaseType}</div>
              <div className={styles.tierList}>
                {epTiers.map((tier, i) => (
                  <button
                    key={i}
                    className={`${styles.tierItem}${selectedEpTier === i ? ` ${styles.tierSelected}` : ''}`}
                    onClick={() => { setSelectedEpTier(i); setSelectedTrackTier(null); }}
                  >
                    <div className={styles.tierRadio}>
                      <div className={styles.tierRadioInner} />
                    </div>
                    <div className={styles.tierInfo}>
                      <div className={styles.tierLabel}>{tier.label}</div>
                      <div className={styles.tierDesc}>{tier.description}</div>
                    </div>
                    <div className={styles.tierPrice}>
                      {tier.currency === 'NGN' ? '₦' : '$'}{tier.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              {selectedTier ? (
                <div className={styles.checkoutPane}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email for download link</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    className={`btn btn-gold ${styles.purchaseBtn}`}
                    onClick={handleCheckout}
                    disabled={redirecting}
                  >
                    {redirecting
                      ? 'Redirecting to checkout…'
                      : `Proceed to Checkout — ${selectedTier.currency === 'NGN' ? '₦' : '$'}${selectedTier.price.toFixed(2)}`}
                  </button>
                </div>
              ) : (
                <button className={`btn btn-gold ${styles.purchaseBtn}`} disabled style={{ opacity: 0.4, cursor: 'default' }}>
                  Select a download option above
                </button>
              )}
              <div className={styles.secureNote}>🔒 Secure checkout via Credo · Instant download after purchase</div>
            </div>
          </>
        )}

        {stage === 'payment' && (
          <div className={styles.checkoutPane}>
            <div className={styles.checkoutTitle}>Payment Details</div>
            <div className={styles.checkoutSummary}>
              {selectedTier?.label} — {selectedTier?.currency === 'NGN' ? '₦' : '$'}{selectedTier?.price.toFixed(2)}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Card Number</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="1234 5678 9012 3456"
                value={formatCard('')}
                onChange={e => {}}
                readOnly
              />
            </div>
            <div className={styles.cardRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Expiry</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="MM / YY"
                  value={formatExpiry('')}
                  readOnly
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>CVV</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="123"
                  maxLength={4}
                  readOnly
                />
              </div>
            </div>

            <button
              className={`btn btn-gold ${styles.payBtn}`}
              onClick={handleCheckout}
              disabled={redirecting}
            >
              {redirecting ? 'Redirecting…' : `Pay ${selectedTier?.currency === 'NGN' ? '₦' : '$'}${selectedTier?.price.toFixed(2)} via Credo`}
            </button>
            <button className={styles.backBtn} onClick={() => setStage('options')}>
              ← Back to options
            </button>
            <p className={styles.secureNote}>🔒 Payments processed securely by Credo. Supports Card, Bank Transfer, USSD, and Wallet.</p>
          </div>
        )}

        {stage === 'success' && (
          <div className={styles.successPane}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>Purchase complete!</h3>
            <p className={styles.successMsg}>
              Your download link has been sent to{' '}
              <strong>{email || 'your email address'}</strong>.<br />
              {downloadToken ? (
                <>Download token: <code>{downloadToken}</code></>
              ) : (
                'The link expires in 72 hours.'
              )}
            </p>
            <a href="#" className={`btn btn-gold ${styles.downloadBtn}`}>
              ⬇ Download Now
            </a>
            <button className={styles.backBtn} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
