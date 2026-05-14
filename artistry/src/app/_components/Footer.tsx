import Link from 'next/link';

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  soundcloud?: string;
}

interface Props {
  socialLinks?: SocialLinks;
  footerText?: string;
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
            <li><Link href="/merch">Merch</Link></li>
            <li><Link href="/media">Press Kit</Link></li>
            <li><Link href="/contact">Booking</Link></li>
            <li><Link href="/subscribe">Newsletter</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{footerText || '\u00A9 2025 Poshbugati \u00B7 All rights reserved'}</p>
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
        </div>
      </div>
    </footer>
  );
}
