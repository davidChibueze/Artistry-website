'use client';

import { useState } from 'react';
import styles from './FeaturedVideo.module.css';

interface Props {
  videoId: string;
  title: string;
}

export default function FeaturedVideo({ videoId, title }: Props) {
  const [playing, setPlaying] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.player}>
        {playing ? (
          <iframe
            className={styles.iframe}
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className={styles.thumb}
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            style={{ backgroundImage: `url('${thumbnailUrl}')` }}
          >
            <span className={styles.playRing}>
              <span className={styles.playTriangle} />
            </span>
          </button>
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.metaTitle}>{title}</span>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.watchBtn}
        >
          Watch on YouTube ↗
        </a>
      </div>
    </div>
  );
}
