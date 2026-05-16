import type { Metadata } from 'next'

import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order — Poshbugati.',
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return (
    <>
      <div className="music-hero-bg" style={{ paddingBottom: 24 }}>
        <div className="page-kicker">Checkout</div>
        <h1 className="page-title">Almost <em>there</em></h1>
      </div>
      <CheckoutClient />
    </>
  )
}
