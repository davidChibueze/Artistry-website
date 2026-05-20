import Link from 'next/link';

interface SocialLinks {
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  soundcloud?: string | null;
  appleMusic?: string | null;
  twitter?: string | null;
  spotify?: string | null;
}

interface NavItem {
  label?: string | null;
  url?: string | null;
  external?: boolean | null;
  locations?: string[] | null;
}

interface Props {
  socialLinks?: SocialLinks | null;
  footerText?: string | null;
  navItems?: NavItem[] | null;
}

export default function Footer({ socialLinks, footerText }: Props) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-text">poshbugati</div>
          <p>{footerText || 'Afro country artist. The Switch EP — exclusive on poshbugati.com.'}</p>
        </div>
        <div className="footer-col">
          <h4>Music</h4>
          <ul>
            <li><Link href="/music">The Switch EP</Link></li>
            <li><Link href="/music">All Releases</Link></li>
            <li><Link href="/subscribe">Stream Exclusive</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Artist</h4>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/tour">Tour Dates</Link></li>
            <li><Link href="/podcast">Podcast</Link></li>
            <li><Link href="/blog">Journal</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <ul>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/media">Press Kit</Link></li>
            <li><Link href="/contact">Booking</Link></li>
            <li><Link href="/subscribe">Newsletter</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{footerText || '© 2025 Poshbugati · All rights reserved'}</p>
        <div className="footer-socials">
          {socialLinks?.instagram && (
            <a href={socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          )}
          {socialLinks?.tiktok && (
            <a href={socialLinks.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z"/>
              </svg>
            </a>
          )}
          {socialLinks?.youtube && (
            <a href={socialLinks.youtube} aria-label="YouTube" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
              </svg>
            </a>
          )}
          {socialLinks?.soundcloud && (
            <a href={socialLinks.soundcloud} aria-label="SoundCloud" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.175 12.225c-.015-.125-.03-.25-.03-.375 0-2.15 1.75-3.9 3.9-3.9.825 0 1.6.25 2.225.675V7.05c0-.575.475-1.05 1.05-1.05s1.05.475 1.05 1.05v5.225a3.9 3.9 0 0 1-3.9 3.9c-1.8 0-3.325-1.225-3.775-2.875A3.89 3.89 0 0 1 1.175 12.225zm5.05-.075a1.85 1.85 0 1 0-3.7 0 1.85 1.85 0 0 0 3.7 0zm7.2.075c-.01-.125-.025-.25-.025-.375 0-2.15 1.75-3.9 3.9-3.9.85 0 1.625.275 2.25.7V4c0-.55.45-1 1-1s1 .45 1 1v8.225a3.9 3.9 0 0 1-3.9 3.9c-1.8 0-3.325-1.225-3.775-2.875a3.94 3.94 0 0 1-.45-1.95zm5.075-.075a1.85 1.85 0 1 0-3.7 0 1.85 1.85 0 0 0 3.7 0z"/>
              </svg>
            </a>
          )}
          {socialLinks?.appleMusic && (
            <a href={socialLinks.appleMusic} aria-label="Apple Music" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </a>
          )}
          {socialLinks?.twitter && (
            <a href={socialLinks.twitter} aria-label="Twitter / X" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </a>
          )}
          {socialLinks?.spotify && (
            <a href={socialLinks.spotify} aria-label="Spotify" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
