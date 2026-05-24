'use client';

import { useEffect } from 'react';

// Individual elements that fade-up on their own
const SOLO_SELECTORS = [
  '.section-label',
  '.section-title',
  '.page-kicker',
  '.page-title',
  '.page-sub',
  '.sub-cta',
  '.quote-band blockquote',
  '.ep-featured-tag',
  '.ep-featured-title',
  '.ep-featured-desc',
  '.ep-featured-actions',
  '.bio-block',
  '.pressEnquiryBlock',
  '.stream-bar',
  '.featured-video-wrap',
].join(',');

// Container selectors — their direct children stagger in as a group
const GROUP_SELECTORS = [
  '.photo-grid',
  '.releases-grid',
  '.news-strip',
  '.platform-grid',
  '.videos-grid',
  '.press-grid',
  '.epk-downloads',
  '.footer-grid',
].join(',');

// Items that stagger within their own sibling context
// NOTE: .feat-card and .merch-card are intentionally excluded here —
// MarqueeCarousel duplicates the DOM set for infinite scroll, so observing
// individual cards would double-fire and leave set-B permanently invisible.
const SIBLING_SELECTORS = [
  '.release-card',
  '.tour-show',
  '.news-item',
].join(',');

// Hero selectors animated on mount (they're in the initial viewport, so
// IntersectionObserver fires immediately with no visual effect)
const HERO_SEQUENCE = ['.hero-eyebrow', '.hero-h1', '.hero-actions'];

const STAGGER_STEP = 100; // ms per child

export default function ScrollRevealInit() {
  useEffect(() => {
    // ── Hero: animate on mount with staggered setTimeout ─────────────
    const heroEls = HERO_SEQUENCE.flatMap(sel =>
      Array.from(document.querySelectorAll<HTMLElement>(sel))
    );
    heroEls.forEach(el => el.classList.add('sr'));
    heroEls.forEach((el, i) => {
      setTimeout(() => {
        el.style.transitionDelay = '0s';
        el.classList.add('sr-visible');
      }, 120 + i * STAGGER_STEP);
    });

    // ── Solo reveals ──────────────────────────────────────────────────
    const soloEls = document.querySelectorAll<HTMLElement>(SOLO_SELECTORS);
    soloEls.forEach(el => el.classList.add('sr'));

    const soloObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.transitionDelay = '0s';
            entry.target.classList.add('sr-visible');
            soloObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );
    soloEls.forEach(el => soloObserver.observe(el));

    // ── Staggered group reveals ───────────────────────────────────────
    const groupEls = document.querySelectorAll<HTMLElement>(GROUP_SELECTORS);

    const groupObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const children = Array.from(entry.target.children) as HTMLElement[];
            children.forEach((child, i) => {
              child.classList.add('sr');
              child.style.transitionDelay = `${i * STAGGER_STEP}ms`;
              requestAnimationFrame(() => requestAnimationFrame(() => child.classList.add('sr-visible')));
            });
            groupObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -80px 0px' }
    );
    groupEls.forEach(el => groupObserver.observe(el));

    // ── Sibling stagger (cards in arbitrary containers) ───────────────
    const siblingEls = document.querySelectorAll<HTMLElement>(SIBLING_SELECTORS);
    siblingEls.forEach(el => el.classList.add('sr'));

    const siblingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
            const idx = siblings.indexOf(el);
            el.style.transitionDelay = `${Math.min(idx, 5) * STAGGER_STEP}ms`;
            el.classList.add('sr-visible');
            siblingObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );
    siblingEls.forEach(el => siblingObserver.observe(el));

    return () => {
      soloObserver.disconnect();
      groupObserver.disconnect();
      siblingObserver.disconnect();
    };
  }, []);

  return null;
}
