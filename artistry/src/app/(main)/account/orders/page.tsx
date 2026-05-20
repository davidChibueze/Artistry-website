import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'

import { fetchOrdersByCustomerToken } from '@/lib/orders'
import { formatMoney } from '@/lib/money'

export const metadata: Metadata = {
  title: 'Your orders',
  robots: { index: false, follow: false },
}

export default async function AccountOrdersPage() {
  const cookieStore = await cookies()
  const customerToken = cookieStore.get('customer_token')?.value

  const orders = customerToken ? await fetchOrdersByCustomerToken(customerToken) : []

  if (orders.length === 0) {
    return (
      <>
        <div className="music-hero-bg" style={{ paddingBottom: 24 }}>
          <div className="page-kicker">Your orders</div>
          <h1 className="page-title">No orders <em>yet</em></h1>
        </div>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            We&apos;ll remember orders placed from this browser. If you&apos;ve checked out before on another device,
            use the lookup page to pull up your order.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/orders/lookup" className="btn btn-outline">Find an order</Link>
            <Link href="/shop" className="btn btn-gold">Browse shop</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="music-hero-bg" style={{ paddingBottom: 24 }}>
        <div className="page-kicker">Your orders</div>
        <h1 className="page-title">Your <em>orders</em></h1>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => (
            <Link
              key={order.orderNumber}
              href={order.lookupUrl.replace(/^https?:\/\/[^/]+/, '')}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 16,
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{order.orderNumber}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.65, marginTop: 2 }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                  {order.status ? ` · ${order.status}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 500 }}>
                {order.total != null ? formatMoney(order.total, order.displayCurrency) : ''}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
