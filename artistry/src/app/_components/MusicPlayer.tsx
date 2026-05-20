'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import AudioPreviewBar from './AudioPreviewBar';
import DistributionModal from './DistributionModal';
import styles from './MusicPlayer.module.css';

export interface Track {
  id?: string | null;
  n?: number | null;
  name?: string | null;
  sub?: string | null;
  dur?: string | null;
  badge?: string | null;
  previewUrl?: string | null;
  priceUSD?: number | null;
  priceNGN?: number | null;
}

export interface DistributionTier {
  id?: string | null;
  label?: string | null;
  description?: string | null;
  priceUSD?: number | null;
  priceNGN?: number | null;
}

interface Props {
  releaseId: number | string;
  tracks: Track[];
  releaseTitle?: string | null;
  releaseType?: string | null;
  streamUrl?: string | null;
  distributionTiers?: DistributionTier[] | null;
}

const PREVIEW_LIMIT = 30;

export default function MusicPlayer({
  releaseId,
  tracks,
  releaseTitle = 'The Switch',
  releaseType = 'EP',
  streamUrl,
  distributionTiers,
}: Props) {
  const [previewingN, setPreviewingN] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks.find(t => t.n != null && t.n === previewingN) ?? null;

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    audioRef.current = null;
    setPreviewingN(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const startPreview = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (!track.previewUrl) return;
    const audio = new Audio(track.previewUrl);
    audio.volume = 0.8;
    audioRef.current = audio;
    audio.play().catch(() => { /* no-op if file unavailable */ });
    setPreviewingN(track.n ?? null);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePreview = useCallback((track: Track) => {
    if (track.n != null && previewingN === track.n) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      startPreview(track);
    }
  }, [previewingN, isPlaying, startPreview]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setProgress(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (progress >= PREVIEW_LIMIT && isPlaying) {
      const track = currentTrack;
      stopPreview();
      if (track) setModalTrack(track);
    }
  }, [progress, isPlaying, stopPreview, currentTrack]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <>
      <div className={`tracklist ${styles.tracklist}`}>
        {tracks.map(t => {
          const isPreviewing = previewingN === t.n;
          return (
            <div key={t.n} className={`track${isPreviewing ? ' playing' : ''}`}>
              <div className="t-num">
                {isPreviewing && isPlaying ? '▶' : t.n}
              </div>
              <div className="t-info">
                <div className="t-name">{t.name}</div>
                <div className="t-sub">{t.sub}</div>
              </div>
              {t.badge ? <span className="t-badge">{t.badge}</span> : <span />}
              <div className="t-dur">{t.dur}</div>
              <div className={styles.trackActions}>
                <button
                  className={`${styles.previewBtn}${isPreviewing ? ` ${styles.previewBtnActive}` : ''}`}
                  onClick={() => togglePreview(t)}
                  aria-label={isPreviewing && isPlaying ? 'Pause preview' : `Preview ${t.name} — 30 seconds`}
                >
                  {isPreviewing && isPlaying ? '⏸' : '▶'}
                  <span className={styles.previewBtnLabel}>{isPreviewing ? 'Preview' : '30s'}</span>
                </button>
                <button
                  className={styles.getBtn}
                  onClick={() => setModalTrack(t)}
                  aria-label={`Get ${t.name} — download or stream`}
                >
                  <span className={styles.getBtnLabel}>Get Track</span>
                  <span className={styles.getBtnShort} aria-hidden="true">Get</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.epActions}>
        <span className={styles.epActionsLabel}>Own the complete {(releaseType || 'EP').toLowerCase()}</span>
        <button className="btn btn-outline btn-sm" onClick={() => setModalTrack(tracks[0])}>
          Stream Options
        </button>
        <button className="btn btn-gold btn-sm" onClick={() => setModalTrack(tracks[0])}>
          Buy Full {releaseType} →
        </button>
      </div>

      {currentTrack && (
        <AudioPreviewBar
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          previewLimit={PREVIEW_LIMIT}
          onToggle={() => togglePreview(currentTrack)}
          onClose={stopPreview}
          onGetTrack={() => setModalTrack(currentTrack)}
        />
      )}

      {modalTrack && (
        <DistributionModal
          releaseId={releaseId}
          track={modalTrack}
          releaseTitle={releaseTitle}
          releaseType={releaseType}
          trackCount={tracks.length}
          streamUrl={streamUrl}
          distributionTiers={distributionTiers}
          onClose={() => setModalTrack(null)}
          onPreview={() => togglePreview(modalTrack)}
          isPreviewPlaying={modalTrack.n != null && previewingN === modalTrack.n && isPlaying}
        />
      )}
    </>
  );
}
