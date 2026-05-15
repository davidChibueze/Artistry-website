'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface NavItem {
  label?: string | null;
  url?: string | null;
  external?: boolean | null;
  cta?: boolean | null;
}

interface Props {
  items: NavItem[];
  linktreeUrl?: string | null;
}

export default function Nav({ items, linktreeUrl }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav id="nav" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-brand">
          <Link className="nav-logo" href="/">poshbugati</Link>
          {linktreeUrl && (
            <a
              className="nav-linktree-pill"
              href={linktreeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="All links (opens in new tab)"
            >
              Links
              <ArrowUpRight aria-hidden="true" />
            </a>
          )}
        </div>
        <ul className="nav-links">
          {items.map(({ label, url, external, cta }) => {
            if (!url) return null;
            return (
              <li key={url}>
                {external ? (
                  <a href={url} target="_blank" rel="noreferrer" className={pathname === url ? 'active' : ''}>{label}</a>
                ) : cta ? (
                  <Link href={url} className="nav-cta-link">{label}</Link>
                ) : (
                  <Link href={url} className={pathname === url ? 'active' : ''}>{label}</Link>
                )}
              </li>
            );
          })}
        </ul>
        <button
          className="nav-hamburger"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div id="mobile-menu" className={menuOpen ? 'open' : ''}>
        <button className="mm-close" onClick={close}>✕</button>
        {items.map(({ label, url, external }) => {
          if (!url) return null;
          return external ? (
            <a key={url} href={url} onClick={close}>{label}</a>
          ) : (
            <Link key={url} href={url} onClick={close}>{label}</Link>
          );
        })}
      </div>
    </>
  );
}
