'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createContactSubmission } from '@/lib/api';
import styles from './ContactForm.module.css';

interface ContactEmails {
  general?: string | null;
  booking?: string | null;
  press?: string | null;
}

interface SocialLinks {
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  soundcloud?: string | null;
  appleMusic?: string | null;
  twitter?: string | null;
  spotify?: string | null;
}

interface Props {
  contactEmails?: ContactEmails | null;
  socialLinks?: SocialLinks | null;
}

export default function ContactForm({ contactEmails, socialLinks }: Props) {
  const [form, setForm] = useState({ name: '', email: '', msg: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const submit = async () => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push('name');
    if (!form.email.trim()) missing.push('email');
    if (!form.msg.trim()) missing.push('msg');
    setErrors(missing);
    if (missing.length) {
      setTimeout(() => setErrors([]), 2000);
      return;
    }
    setLoading(true);
    try {
      await createContactSubmission({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.msg.trim(),
      });
      setSubmitted(true);
    } catch {
      setErrors(['submit']);
      setTimeout(() => setErrors([]), 3000);
    }
    setLoading(false);
  };

  const errClass = (field: string) => errors.includes(field) ? ` ${styles.fieldError}` : '';

  const bookingEmail = contactEmails?.booking || 'booking@poshbugati.com';
  const pressEmail = contactEmails?.press || 'press@poshbugati.com';
  const generalEmail = contactEmails?.general || 'hello@poshbugati.com';

  return (
    <>
      <div className="contact-layout">
        <div>
          <div className="section-label">Direct Contacts</div>
          <h2 className={`section-title ${styles.sectionMb32}`}>Reach the <em>right person</em></h2>
          <div className="contact-info-block">
            <div className="ci-item">
              <div className="ci-label">Live Booking & Performance</div>
              <div className="ci-value"><a href={`mailto:${bookingEmail}`}>{bookingEmail}</a></div>
              <div className="ci-sub">Headline shows, festival slots, private events. Include date, venue, budget, and expected audience in your first message.</div>
            </div>
            <div className="ci-item">
              <div className="ci-label">Press & Media</div>
              <div className="ci-value"><a href={`mailto:${pressEmail}`}>{pressEmail}</a></div>
              <div className="ci-sub">Interviews, features, review copies of The Switch. Press kit available to download on the <Link href="/media" className={styles.goldLink}>Media page</Link>.</div>
            </div>
            <div className="ci-item">
              <div className="ci-label">Sync & Licensing</div>
              <div className="ci-value"><a href="mailto:sync@poshbugati.com">sync@poshbugati.com</a></div>
              <div className="ci-sub">Film, TV, advertising, and brand placements. All masters owned by Poshbugati — fast turnaround on licensing requests.</div>
            </div>
            <div className="ci-item">
              <div className="ci-label">General & Fan Mail</div>
              <div className="ci-value"><a href={`mailto:${generalEmail}`}>{generalEmail}</a></div>
              <div className="ci-sub">Everything else. We read it all.</div>
            </div>
            <div className="ci-item">
              <div className="ci-label">Management</div>
              <div className="ci-value">Available on request</div>
              <div className="ci-sub">Contact {bookingEmail} for management referrals.</div>
            </div>
          </div>
          <div className="response-badge">
            <div className="response-dot" />
            Typically responds within 48 hours
          </div>
          <div className={styles.socialWrap}>
            <div className="section-label">Follow &amp; Connect</div>
            <div className="social-strip">
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} className="soc-btn" target="_blank" rel="noreferrer">
                  <svg className="soc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  Instagram
                </a>
              )}
              {socialLinks?.tiktok && (
                <a href={socialLinks.tiktok} className="soc-btn" target="_blank" rel="noreferrer">
                  <svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-6.13 6.29 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z"/>
                  </svg>
                  TikTok
                </a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} className="soc-btn" target="_blank" rel="noreferrer">
                  <svg className="soc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                  YouTube
                </a>
              )}
              {socialLinks?.appleMusic && (
                <a href={socialLinks.appleMusic} className="soc-btn" target="_blank" rel="noreferrer">
                  <svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple Music
                </a>
              )}
              {socialLinks?.twitter && (
                <a href={socialLinks.twitter} className="soc-btn" target="_blank" rel="noreferrer">
                  <svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                  </svg>
                  Twitter / X
                </a>
              )}
              {socialLinks?.spotify && (
                <a href={socialLinks.spotify} className="soc-btn" target="_blank" rel="noreferrer">
                  <svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="contact-form-wrap">
          <div className="section-label">Send a Message</div>
          <h2 className={`section-title ${styles.sectionMb32}`}>Write to <em>us</em></h2>

          {!submitted ? (
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="cfName">Name *</label>
                <input type="text" id="cfName" className={`form-input${errClass('name')}`} placeholder="Your full name" value={form.name} onChange={update('name')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cfEmail">Email *</label>
                <input type="email" id="cfEmail" className={`form-input${errClass('email')}`} placeholder="your@email.com" value={form.email} onChange={update('email')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cfMsg">Message *</label>
                <textarea id="cfMsg" className={`form-textarea ${styles.textarea}`} placeholder="Tell us about your project, event, or idea…" value={form.msg} onChange={update('msg') as React.ChangeEventHandler<HTMLTextAreaElement>} />
              </div>
              {errors.includes('submit') && (
                <p className={styles.fieldError}>Something went wrong. Please try again.</p>
              )}
              <button className={`btn btn-gold ${styles.submitBtn}`} onClick={submit} disabled={loading}>
                {loading ? 'Sending…' : 'Send Message'}
              </button>
              <p className={styles.submitNote}>We respond to all serious inquiries within 48 hours.</p>
            </div>
          ) : (
            <div className={`form-success ${styles.formSuccessVisible}`}>
              <div className="form-success-icon">✉️</div>
              <h3>Message sent.</h3>
              <p>We&apos;ll be in touch within 48 hours. For urgent matters, email <a href={`mailto:${bookingEmail}`} className={styles.urgentLink}>{bookingEmail}</a> directly.</p>
            </div>
          )}
        </div>
      </div>

      <div className="rider-block">
        <div>
          <h3>Need the <em>technical rider?</em></h3>
          <p>Stage plot, input list, hospitality rider, and full production requirements for live performances. Available to confirmed promoters and venues on request.</p>
        </div>
        <a href={`mailto:${bookingEmail}?subject=Technical Rider Request`} className="btn btn-outline">Request Rider</a>
      </div>
    </>
  );
}
