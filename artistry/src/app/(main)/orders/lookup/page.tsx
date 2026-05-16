import type { Metadata } from 'next'
import Link from 'next/link'

import { fetchOrderByMagicLink } from '@/lib/orders'

import OrderView, { OrderNotFound } from '../[orderNumber]/OrderView'
import RequestForm from './RequestForm'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: 'Find your order',
  robots: { index: false, follow: false },
}

export default async function OrderLookupPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (token) {
    const order = await fetchOrderByMagicLink(token)
    if (!order) {
      return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 12 }}>
            This link has expired.
          </h1>
          <p style={{ opacity: 0.7, marginBottom: 24 }}>
            Magic links are valid for 24 hours. Request a fresh one below.
          </p>
          <Link className="btn btn-gold" href="/orders/lookup">Request a new link</Link>
        </div>
      )
    }
    return <OrderView order={order} />
  }

  return (
    <>
      <div className="music-hero-bg" style={{ paddingBottom: 24 }}>
        <div className="page-kicker">Order lookup</div>
        <h1 className="page-title">Find your <em>order</em></h1>
      </div>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <RequestForm />
      </div>
    </>
  )
}
