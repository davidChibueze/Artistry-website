'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Music, X } from 'lucide-react';
import styles from './AnnounceBar.module.css';

const DISMISS_KEY = 'announce-bar-dismissed';

interface Props {
  text: string;
  linkText?: string | null;
  linkUrl?: string | null;
}

export default function AnnounceBarClient({ text, linkText, linkUrl }: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="announce-bar">
      <span className={styles.message}>
        <Music className={styles.icon} />
        {text}
      </span>
      {linkUrl && linkText ? (
        <Link href={linkUrl} className={styles.link}>{linkText} →</Link>
      ) : null}
      <button
        type="button"
        className={styles.closeBtn}
        aria-label="Dismiss announcement"
        onClick={dismiss}
      >
        <X className={styles.closeIcon} aria-hidden="true" />
      </button>
    </div>
  );
}
