'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Music, BookOpen, ShoppingBag, Mail } from 'lucide-react';
import { createSubscription } from '@/lib/api';
import styles from './SubscribePageClient.module.css';

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, target.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

interface Props {
  epReleaseDate?: string | null;
}

export default function SubscribePageClient({ epReleaseDate }: Props) {
  const target = epReleaseDate ? new Date(epReleaseDate) : new Date('2025-05-22T00:00:00');
  const { d, h, m, s, done } = useCountdown(target);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSub = async () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !re.test(email)) {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 2000);
      return;
    }
    setLoading(true);
    try {
      await createSubscription({
        email: email.trim(),
        firstName: first.trim() || undefined,
        lastName: last.trim() || undefined,
        type: 'Fan Club',
      });
      setSuccess(true);
    } catch {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 3000);
    }
    setLoading(false);
  };

  return (
    <section className="sub-page">
      <div className="sub-left">
        <Link className="sub-left-logo" href="/">poshbugati</Link>

        {!success ? (
          <div>
            <div className="sub-eyebrow">Fan Club · Inner Circle</div>
            <h1 className="sub-headline">Get in <em>early.</em></h1>
            <p className="sub-desc">
              The Switch drops <strong>{target.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, exclusively on poshbugati.com.</strong> Join the inner circle and get 48-hour early stream access, digital liner notes, merch bundle priority, and a message straight from the artist.
            </p>

            <div className="perks">
              {[
                { icon: <Music className={`icon-lg perk-icon ${styles.perkIcon}`} />, title: '48-Hour Early Stream', desc: 'Hear The Switch two full days before public release. First in, first served.' },
                { icon: <BookOpen className={`icon-lg perk-icon ${styles.perkIcon}`} />, title: 'Digital Liner Notes', desc: 'Full lyrics, production notes, and behind-the-scenes commentary from Poshbugati.' },
                { icon: <ShoppingBag className={`icon-lg perk-icon ${styles.perkIcon}`} />, title: 'Merch Bundle Priority', desc: 'First access to limited The Switch merch before public sale. Bundles sell out fast.' },
                { icon: <Mail className={`icon-lg perk-icon ${styles.perkIcon}`} />, title: 'Direct Message from the Artist', desc: 'A personal note from Poshbugati on the making of The Switch — only to this list.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="perk">
                  {icon}
                  <div className="perk-body">
                    <div className="perk-title">{title}</div>
                    <div className="perk-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sub-form-wrap">
              <div className="sub-fields">
                <div className="name-row">
                  <input type="text" className="sub-field" placeholder="First name" value={first} onChange={e => setFirst(e.target.value)} />
                  <input type="text" className="sub-field" placeholder="Last name" value={last} onChange={e => setLast(e.target.value)} />
                </div>
                <input
                  type="email"
                  className={`sub-field${emailError ? ` ${styles.emailError}` : ''}`}
                  placeholder="Email address *"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSub(); }}
                />
              </div>
              <button className="sub-submit" onClick={handleSub} disabled={loading}>
                {loading ? 'Joining…' : 'Join the Inner Circle'}
              </button>
              <p className="sub-note">No spam. One email per drop. Unsubscribe any time.</p>
            </div>
          </div>
        ) : (
          <div className={`sub-success ${styles.subSuccessVisible}`}>
            <div className="sub-success-glyph">
              <Music className={styles.successMusicIcon} />
            </div>
            <h3>You&apos;re in.</h3>
            <p>Welcome to the inner circle. Check your inbox — early access details for The Switch are on their way.</p>
            <div className={styles.successActions}>
              <Link href="/music" className="btn btn-outline btn-sm">Preview Tracks</Link>
              <Link href="/merch" className="btn btn-gold btn-sm">Browse Merch</Link>
            </div>
          </div>
        )}
      </div>

      <div className="sub-right">
        <div className="sub-ep-preview">
          <div className="ep-art-full">
            <div className="ep-art-genre">Afro Country · 2025</div>
            <div className="ep-art-name">The<br />Switch</div>
            <div className="ep-art-rule" />
            <div className="ep-art-artist">poshbugati</div>
            <div className={`ep-art-rule ${styles.artRuleSpaced}`} />
            <div className="ep-art-tracks">New Roots · Sundown Dance<br />The Crossing · Red Earth<br />Come Back Home</div>
          </div>
          <div className="countdown-block">
            <div className="countdown-label">Drops in</div>
            <div className="countdown-display">
              {done ? (
                <div className="countdown-unit">
                  <div className={`countdown-n ${styles.countdownDone}`}>Out Now</div>
                </div>
              ) : (
                <>
                  {[{ n: d, u: 'Days' }, { n: h, u: 'Hours' }, { n: m, u: 'Mins' }, { n: s, u: 'Secs' }].map(({ n, u }, i, arr) => (
                    <>
                      <div key={u} className="countdown-unit">
                        <div className="countdown-n">{pad(n)}</div>
                        <div className="countdown-u">{u}</div>
                      </div>
                      {i < arr.length - 1 && <div className="countdown-sep">:</div>}
                    </>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
