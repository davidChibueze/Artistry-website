import Link from 'next/link'

import type { PublicOrder } from '@/lib/orders'
import { formatMoney, type SupportedCurrency } from '@/lib/money'

import styles from './OrderView.module.css'

function pickItemPrice(item: { priceUSD?: number | null; priceNGN?: number | null }, currency: SupportedCurrency) {
  return currency === 'NGN' ? item.priceNGN ?? 0 : item.priceUSD ?? 0
}

interface Props {
  order: PublicOrder
}

export default function OrderView({ order }: Props) {
  const currency = order.displayCurrency

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.kicker}>Order</div>
          <h1>{order.orderNumber}</h1>
        </div>
        {order.status && (
          <span className={styles.statusBadge} data-status={order.status}>
            {order.status}
          </span>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Items</h2>
        {order.items.map((item, idx) => {
          const qty = item.quantity ?? 1
          const lineTotal = pickItemPrice(item, currency) * qty
          return (
            <div key={`${item.productId}-${item.variantId ?? ''}-${idx}`} className={styles.line}>
              <div>
                <div className={styles.lineName}>{item.name}</div>
                <div className={styles.lineSub}>
                  {item.variantLabel ? `${item.variantLabel} · ` : ''}
                  × {qty}
                  {item.sku ? ` · ${item.sku}` : ''}
                </div>
              </div>
              <div className={styles.linePrice}>{formatMoney(lineTotal, currency)}</div>
            </div>
          )
        })}

        <div style={{ marginTop: 12 }}>
          {order.subtotal != null && (
            <div className={styles.totalsRow}>
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal, currency)}</span>
            </div>
          )}
          {order.shipping != null && order.shipping > 0 && (
            <div className={styles.totalsRow}>
              <span>Shipping</span>
              <span>{formatMoney(order.shipping, currency)}</span>
            </div>
          )}
          {order.total != null && (
            <div className={`${styles.totalsRow} ${styles.grand}`}>
              <span>Total</span>
              <span>{formatMoney(order.total, currency)}</span>
            </div>
          )}
        </div>
      </div>

      {order.downloadUrl && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Digital downloads</h2>
          <a className={styles.downloadBtn} href={order.downloadUrl}>
            Download
          </a>
          {order.downloadExpiresAt && (
            <div className={styles.downloadExpiry}>
              Link expires {new Date(order.downloadExpiresAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {order.shippingAddress && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping to</h2>
          <div>{order.customerName}</div>
          {order.shippingAddress.line1 && <div>{order.shippingAddress.line1}</div>}
          {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
          <div>
            {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
              .filter(Boolean)
              .join(', ')}
          </div>
          {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Receipt</h2>
        <div>
          {order.customerName} · {order.customerEmail}
        </div>
        {order.paymentProvider && (
          <div className={styles.lineSub} style={{ marginTop: 4 }}>
            Paid via {order.paymentProvider === 'paypal' ? 'PayPal' : 'Credo'}
            {order.paidCurrency && order.paidAmount != null
              ? ` — ${formatMoney(order.paidAmount, order.paidCurrency)}`
              : ''}
          </div>
        )}
        {order.createdAt && (
          <div className={styles.lineSub}>
            Placed {new Date(order.createdAt).toLocaleString()}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/merch" className="btn btn-outline">Keep shopping</Link>
      </div>
    </div>
  )
}

export function OrderNotFound() {
  return (
    <div className={styles.empty}>
      <h2>We couldn&apos;t find that order.</h2>
      <p>
        The link may have expired or been mistyped. You can request a fresh link by entering your email and
        order number on the lookup page.
      </p>
      <Link href="/orders/lookup" className="btn btn-gold">Find my order</Link>
    </div>
  )
}
