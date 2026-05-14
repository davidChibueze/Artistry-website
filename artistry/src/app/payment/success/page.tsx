'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyPayment } from '@/lib/api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transRef = searchParams.get('transRef');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);

  useEffect(() => {
    if (!transRef) {
      setStatus('failed');
      return;
    }

    verifyPayment(transRef)
      .then(res => {
        if (res.status === 'success') {
          setStatus('success');
          setOrderNumber(res.orderNumber ?? null);
          setDownloadToken(res.downloadToken ?? null);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [transRef]);

  if (status === 'loading') {
    return (
      <section className="section-pad" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Verifying payment…</h2>
          <p>Please wait while we confirm your purchase.</p>
        </div>
      </section>
    );
  }

  if (status === 'failed') {
    return (
      <section className="section-pad" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Payment could not be verified</h2>
          <p>If you were charged, please contact us with your transaction reference.</p>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/music" className="btn btn-gold">Browse Music</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pad" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2>Purchase complete!</h2>
        <p>
          Your download link has been sent to your email.
          {orderNumber && <><br />Order: <strong>{orderNumber}</strong></>}
          {downloadToken && <><br />Download token: <code>{downloadToken}</code></>}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          The link expires in 72 hours.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/music" className="btn btn-gold">Browse Music</Link>
          <Link href="/" className="btn btn-outline">Home</Link>
        </div>
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <section className="section-pad" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading…</h2>
        </div>
      </section>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
