import type { Metadata } from 'next';
import ContactForm from '../../_components/ContactForm';
import { getArtistProfile } from '@/lib/api';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Booking & Contact',
  description: 'For live bookings, press enquiries, sync licensing, collaborations, and anything else — reach out. Responses within 48 hours.',
};

export default async function ContactPage() {
  const artist = await getArtistProfile().catch(() => null);

  return (
    <>
      <div className="contact-hero">
        <div className={styles.heroInner}>
          <div className="page-kicker">Get in Touch</div>
          <h1 className="page-title">Booking &amp;<br /><em>Contact</em></h1>
          <p className="page-sub">For live bookings, press enquiries, sync licensing, collaborations, and anything else — reach out. Responses within 48 hours.</p>
        </div>
      </div>
      <section className="section-pad">
        <div className="section-wrap">
          <ContactForm
            contactEmails={artist?.contactEmails}
            socialLinks={artist?.socialLinks}
          />
        </div>
      </section>
    </>
  );
}
