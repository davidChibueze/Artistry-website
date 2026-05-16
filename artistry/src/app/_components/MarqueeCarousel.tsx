'use client';

import { Children, ReactNode, useMemo, useState } from 'react';
import styles from './MarqueeCarousel.module.css';

interface Props {
  children: ReactNode;
  /** Item width in pixels at desktop. */
  itemWidth?: number;
  /** Gap between items in pixels. */
  gap?: number;
  /** Seconds for one full loop. Lower = faster. */
  duration?: number;
  /** Optional className applied to the viewport. */
  className?: string;
}

export default function MarqueeCarousel({
  children,
  itemWidth = 340,
  gap = 24,
  duration = 40,
  className = '',
}: Props) {
  const [paused, setPaused] = useState(false);

  const items = useMemo(() => Children.toArray(children), [children]);

  if (items.length === 0) return null;

  return (
    <div
      className={`${styles.viewport} ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={
        {
          '--mc-item-w': `${itemWidth}px`,
          '--mc-gap': `${gap}px`,
          '--mc-duration': `${duration}s`,
        } as React.CSSProperties
      }
    >
      <div className={styles.fadeLeft} aria-hidden="true" />
      <div className={styles.fadeRight} aria-hidden="true" />
      <div
        className={styles.track}
        style={{ animationPlayState: paused ? 'paused' : 'running' }}
      >
        <div className={styles.set}>
          {items.map((node, i) => (
            <div key={`a-${i}`} className={styles.item}>
              {node}
            </div>
          ))}
        </div>
        <div className={styles.set} aria-hidden="true">
          {items.map((node, i) => (
            <div key={`b-${i}`} className={styles.item} tabIndex={-1}>
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
