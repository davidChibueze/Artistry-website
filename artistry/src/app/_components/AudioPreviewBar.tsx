'use client';

import styles from './AudioPreviewBar.module.css';
import type { Track } from './MusicPlayer';

interface Props {
  track: Track;
  isPlaying: boolean;
  progress: number;
  previewLimit: number;
  onToggle: () => void;
  onClose: () => void;
  onGetTrack: () => void;
}

function fmt(s: number) {
  return `0:${String(Math.floor(s)).padStart(2, '0')}`;
}

export default function AudioPreviewBar({ track, isPlaying, progress, previewLimit, onToggle, onClose, onGetTrack }: Props) {
  const pct = Math.min((progress / previewLimit) * 100, 100);

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button className={styles.toggleBtn} onClick={onToggle} aria-label={isPlaying ? 'Pause preview' : 'Resume preview'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className={styles.info}>
            <span className={styles.previewLabel}>30s Preview</span>
            <span className={styles.trackName}>{track.name}</span>
          </div>
        </div>

        <div className={styles.center}>
          <div className={styles.progressWrap}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.time}>{fmt(progress)} / {fmt(previewLimit)}</div>
        </div>

        <div className={styles.right}>
          <button className={styles.getBtn} onClick={onGetTrack}>
            Get Track →
          </button>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close preview">✕</button>
        </div>
      </div>
    </div>
  );
}
