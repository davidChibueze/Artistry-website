'use client';

import { useState } from 'react';
import { createSubscription } from '@/lib/api';
import styles from './HomeSubscribeForm.module.css';

export default function HomeSubscribeForm() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('No spam. One email per drop.');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const v = email.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    setLoading(true);
    try {
      await createSubscription({ email: v, type: 'Newsletter' });
      setNote("✓ You're in! Check your inbox for early access details.");
      setEmail('');
    } catch {
      setNote('Something went wrong. Please try again.');
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="sub-form">
        <input
          type="email"
          className={`sub-input${error ? ` ${styles.inputError}` : ''}`}
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          disabled={loading}
        />
        <button className="sub-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Joining…' : 'Join'}
        </button>
      </div>
      <p className="sub-note">{note}</p>
    </>
  );
}
