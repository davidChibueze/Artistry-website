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
  '.hero-eyebrow',
  '.hero-actions',
  '.bio-block',
  '.pressEnquiryBlock',
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

// Items that stagger within their own sibling context (not a named grid container)
const SIBLING_SELECTORS = [
  '.feat-card',
  '.release-card',
  '.tour-show',
  '.merch-card',
].join(',');

const STAGGER_STEP = 80; // ms per child

export default function ScrollRevealInit() {
  useEffect(() => {
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
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
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
              // Small rAF so the browser registers the sr class before adding sr-visible
              requestAnimationFrame(() => requestAnimationFrame(() => child.classList.add('sr-visible')));
            });
            groupObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -32px 0px' }
    );
    groupEls.forEach(el => groupObserver.observe(el));

    // ── Sibling stagger (cards inside carousels / arbitrary containers) ─
    const siblingEls = document.querySelectorAll<HTMLElement>(SIBLING_SELECTORS);
    siblingEls.forEach(el => el.classList.add('sr'));

    const siblingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            // Find sibling index inside its parent for stagger
            const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
            const idx = siblings.indexOf(el);
            el.style.transitionDelay = `${Math.min(idx, 5) * STAGGER_STEP}ms`;
            el.classList.add('sr-visible');
            siblingObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
