'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { formatMoney, priceFor } from '@/lib/money';
import type { DistributionTier, Track } from './MusicPlayer';
import styles from './DistributionModal.module.css';

interface Props {
  releaseId: number | string;
  track: Track;
  releaseTitle?: string | null;
  releaseType?: string | null;
  trackCount: number;
  streamUrl?: string | null;
  distributionTiers?: DistributionTier[] | null;
  onClose: () => void;
  onPreview: () => void;
  isPreviewPlaying: boolean;
}

type Selection =
  | { kind: 'track' }
  | { kind: 'tier'; tierIndex: number };

export default function DistributionModal({
  releaseId,
  track,
  releaseTitle,
  releaseType,
  trackCount,
  streamUrl,
  distributionTiers,
  onClose,
  onPreview,
  isPreviewPlaying,
}: Props) {
  const { addItem } = useCart();
  const { currency } = useCurrency();

  const [selection, setSelection] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiers = distributionTiers ?? [];
  const trackHasPrice = track.priceUSD != null && track.priceNGN != null;

  const selectedTier =
    selection?.kind === 'tier' ? tiers[selection.tierIndex] : null;
  const selectedTrack = selection?.kind === 'track' ? track : null;

  const selectedPrice = selectedTier
    ? priceFor(selectedTier, currency)
    : selectedTrack && trackHasPrice
      ? priceFor(selectedTrack, currency)
      : null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  async function onAddToCart() {
    if (!selection) return;
    setBusy(true);
    setError(null);

    let result;
    if (selection.kind === 'track') {
      if (!track.id) {
        setError('This track is not yet available for purchase.');
        setBusy(false);
        return;
      }
      result = await addItem({
        type: 'Track',
        productId: releaseId,
        variantId: track.id,
        quantity: 1,
      });
    } else {
      const tier = tiers[selection.tierIndex];
      if (!tier?.id) {
        setError('This bundle is not available.');
        setBusy(false);
        return;
      }
      result = await addItem({
        type: 'EP',
        productId: releaseId,
        variantId: tier.id,
        quantity: 1,
      });
    }

    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not add to cart.');
    } else {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.header}>
          <div className={styles.epArtMini}>
            <div className={styles.epArtText}>{(releaseTitle ?? '').toUpperCase().split(' ').slice(0, 2).join('<br/>')}</div>
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

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Stream for Free</div>
          <div className={styles.platformRow}>
            {streamUrl && (
              <a href={streamUrl} className={styles.platBtn} target="_blank" rel="noreferrer">
                <span className={styles.platDot} style={{ background: 'var(--gold)' }} />
                Stream
              </a>
            )}
            <Link href="/subscribe" className={`${styles.platBtn} ${styles.platBtnExclusive}`}>
              <span className={styles.platDot} style={{ background: 'var(--gold)' }} />
              poshbugati.com — Exclusive
            </Link>
          </div>
        </div>

        {trackHasPrice && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Download This Track</div>
            <div className={styles.tierList}>
              <button
                className={`${styles.tierItem}${selection?.kind === 'track' ? ` ${styles.tierSelected}` : ''}`}
                onClick={() => setSelection({ kind: 'track' })}
              >
                <div className={styles.tierRadio}>
                  <div className={styles.tierRadioInner} />
                </div>
                <div className={styles.tierInfo}>
                  <div className={styles.tierLabel}>{track.name}</div>
                  <div className={styles.tierDesc}>Single track · Lossless download after purchase</div>
                </div>
                <div className={styles.tierPrice}>
                  {formatMoney(priceFor(track, currency), currency)}
                </div>
              </button>
            </div>
          </div>
        )}

        {tiers.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Or Get the Full {releaseType}</div>
            <div className={styles.tierList}>
              {tiers.map((tier, i) => (
                <button
                  key={tier.id ?? i}
                  className={`${styles.tierItem}${selection?.kind === 'tier' && selection.tierIndex === i ? ` ${styles.tierSelected}` : ''}`}
                  onClick={() => setSelection({ kind: 'tier', tierIndex: i })}
                >
                  <div className={styles.tierRadio}>
                    <div className={styles.tierRadioInner} />
                  </div>
                  <div className={styles.tierInfo}>
                    <div className={styles.tierLabel}>{tier.label}</div>
                    <div className={styles.tierDesc}>{tier.description}</div>
                  </div>
                  <div className={styles.tierPrice}>
                    {formatMoney(priceFor(tier, currency), currency)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          {selection && selectedPrice != null ? (
            <button
              className={`btn btn-gold ${styles.purchaseBtn}`}
              onClick={() => void onAddToCart()}
              disabled={busy}
            >
              {busy ? 'Adding…' : `Add to Cart — ${formatMoney(selectedPrice, currency)}`}
            </button>
          ) : (
            <button className={`btn btn-gold ${styles.purchaseBtn}`} disabled style={{ opacity: 0.4, cursor: 'default' }}>
              {trackHasPrice || tiers.length > 0
                ? 'Select an option above'
                : 'Not yet for sale'}
            </button>
          )}
          {error && <p style={{ color: 'crimson', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
          <div className={styles.secureNote}>
            Cart locks pricing in {currency}. Checkout supports Credo (NGN) or PayPal (USD).
          </div>
        </div>
      </div>
    </div>
  );
}
