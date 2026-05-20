import styles from './HeroSocials.module.css';

interface SocialLinks {
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  soundcloud?: string | null;
  linktree?: string | null;
  appleMusic?: string | null;
  twitter?: string | null;
  spotify?: string | null;
}

interface Props {
  socials?: SocialLinks | null;
}

// Single-path brand silhouettes (Simple Icons paths, 24×24).
const PATHS = {
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  soundcloud:
    'M17.499 9.082c-.395 0-.776.082-1.122.226-.23-2.602-2.408-4.648-5.062-4.648-.65 0-1.276.124-1.85.348-.222.087-.28.176-.282.347v9.974c.002.18.143.331.317.349h7.999c1.668 0 3.022-1.348 3.022-3.011 0-1.664-1.354-3.585-3.022-3.585zM7.624 5.477c-.232 0-.418.187-.418.418v9.336c0 .23.186.42.418.42.231 0 .418-.19.418-.42V5.895c0-.231-.187-.418-.418-.418zm-1.452.78c-.232 0-.42.187-.42.418v8.555c0 .231.188.418.42.418.23 0 .418-.187.418-.418V6.675c0-.231-.188-.418-.418-.418zm-1.453-.39c-.231 0-.418.187-.418.418v8.945c0 .23.187.418.418.418.232 0 .42-.187.42-.418V6.286c0-.232-.188-.42-.42-.42zm-1.452.95c-.231 0-.42.188-.42.418v7.995c0 .231.189.42.42.42.231 0 .418-.189.418-.42V7.235c0-.23-.187-.418-.418-.418zm-1.453.92c-.232 0-.42.188-.42.418v6.156c0 .231.188.42.42.42.231 0 .418-.189.418-.42V7.155c0-.23-.187-.418-.418-.418zm-1.453.78c-.23 0-.418.188-.418.418v4.595c0 .231.187.418.418.418.232 0 .42-.187.42-.418V8.935c0-.23-.188-.418-.42-.418z',
  linktree:
    'M13.736 5.853l4.005-4.117 2.325 2.388-4.2 4.005h5.909v3.305h-5.937l4.229 4.108-2.325 2.323-5.74-5.769-5.741 5.769-2.325-2.323 4.229-4.108H2.225V8.129h5.909l-4.2-4.005L6.259 1.736l4.005 4.117V0h3.472v5.853zM10.264 18.39h3.472V24h-3.472v-5.61z',
  appleMusic:
    'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z',
  twitter:
    'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  spotify:
    'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d={d} />
    </svg>
  );
}

export default function HeroSocials({ socials }: Props) {
  if (!socials) return null;
  const items: { key: keyof typeof PATHS; href: string; label: string }[] = [];
  if (socials.instagram) items.push({ key: 'instagram', href: socials.instagram, label: 'Instagram' });
  if (socials.tiktok) items.push({ key: 'tiktok', href: socials.tiktok, label: 'TikTok' });
  if (socials.youtube) items.push({ key: 'youtube', href: socials.youtube, label: 'YouTube' });
  if (socials.soundcloud) items.push({ key: 'soundcloud', href: socials.soundcloud, label: 'SoundCloud' });
  if (socials.linktree) items.push({ key: 'linktree', href: socials.linktree, label: 'Linktree' });
  if (socials.appleMusic) items.push({ key: 'appleMusic', href: socials.appleMusic, label: 'Apple Music' });
  if (socials.twitter) items.push({ key: 'twitter', href: socials.twitter, label: 'Twitter / X' });
  if (socials.spotify) items.push({ key: 'spotify', href: socials.spotify, label: 'Spotify' });

  if (items.length === 0) return null;

  return (
    <div className={styles.row}>
      {/* Instagram gradient definition, referenced by fill="url(#hero-ig-grad)" on hover. */}
      <svg width="0" height="0" className={styles.defs} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hero-ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
      </svg>

      {items.map(({ key, href, label }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className={`${styles.link} ${styles[`link_${key}`]}`}
        >
          {key === 'tiktok' ? (
            <span className={styles.tiktokStack}>
              <Icon d={PATHS.tiktok} className={`${styles.tiktokLayer} ${styles.tiktokCyan}`} />
              <Icon d={PATHS.tiktok} className={`${styles.tiktokLayer} ${styles.tiktokMagenta}`} />
              <Icon d={PATHS.tiktok} className={`${styles.tiktokLayer} ${styles.tiktokWhite}`} />
            </span>
          ) : (
            <Icon d={PATHS[key]} className={styles.icon} />
          )}
        </a>
      ))}
    </div>
  );
}
