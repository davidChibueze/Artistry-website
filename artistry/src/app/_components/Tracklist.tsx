'use client';

import { useState } from 'react';

const tracks = [
  { n: 1, name: 'New Roots', sub: 'Afro Country · Lead Single', dur: '3:42', badge: 'Lead Single' },
  { n: 2, name: 'Sundown Dance', sub: 'Afro Country', dur: '3:58', badge: '' },
  { n: 3, name: 'The Crossing', sub: 'Afro Country', dur: '4:11', badge: '' },
  { n: 4, name: 'Red Earth', sub: 'Afro Country', dur: '3:33', badge: '' },
  { n: 5, name: 'Come Back Home', sub: 'Afro Country', dur: '4:27', badge: 'Fan Favourite' },
];

export default function Tracklist() {
  const [playing, setPlaying] = useState<number | null>(null);

  const toggle = (n: number) => setPlaying(prev => prev === n ? null : n);

  return (
    <div className="tracklist">
      {tracks.map(t => (
        <div
          key={t.n}
          className={`track${playing === t.n ? ' playing' : ''}`}
          onClick={() => toggle(t.n)}
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && toggle(t.n)}
        >
          <div className="t-num">{playing === t.n ? '▶' : t.n}</div>
          <div className="t-info">
            <div className="t-name">{t.name}</div>
            <div className="t-sub">{t.sub}</div>
          </div>
          {t.badge
            ? <span className="t-badge">{t.badge}</span>
            : <span />
          }
          <div className="t-dur">{t.dur}</div>
        </div>
      ))}
    </div>
  );
}
