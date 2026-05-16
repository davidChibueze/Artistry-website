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
