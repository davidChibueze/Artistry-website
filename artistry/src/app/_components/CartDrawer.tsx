'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import React, { useEffect } from 'react'

import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import { formatMoney, priceFor, SUPPORTED_CURRENCIES } from '@/lib/money'

import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, updateQuantity, removeItem } = useCart()
  const { currency, setCurrency } = useCurrency()

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeDrawer])

  const items = cart?.items ?? []
  const subtotal = items.reduce((sum, item) => sum + priceFor(item, currency) * item.quantity, 0)

  return (
    <>
      <div
        className={styles.overlay}
        data-open={drawerOpen}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className={styles.drawer}
        data-open={drawerOpen}
        aria-hidden={!drawerOpen}
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.currencyToggle} role="radiogroup" aria-label="Display currency">
          {SUPPORTED_CURRENCIES.map((code) => (
            <button
              key={code}
              type="button"
              className={styles.currencyBtn}
              data-active={currency === code}
              role="radio"
              aria-checked={currency === code}
              onClick={() => void setCurrency(code)}
            >
              {code}
            </button>
          ))}
        </div>

        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>Your cart is empty.</div>
          ) : (
            items.map((item) => {
              const lineId = item.lineId
              const linePrice = priceFor(item, currency) * item.quantity
              return (
                <div key={lineId ?? `${item.productId}-${item.variantId ?? ''}`} className={styles.line}>
                  <div
                    className={styles.lineImg}
                    style={item.imageUrl ? { backgroundImage: `url('${item.imageUrl}')` } : undefined}
                    aria-hidden="true"
                  />
                  <div className={styles.lineBody}>
                    <div className={styles.lineName}>{item.name}</div>
                    {item.variantLabel && (
                      <div className={styles.lineVariant}>{item.variantLabel}</div>
                    )}
                    <div className={styles.lineRow}>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          aria-label="Decrease quantity"
                          onClick={() => {
                            if (!lineId) return
                            void updateQuantity(lineId, Math.max(0, item.quantity - 1))
                          }}
                        >
                          −
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          aria-label="Increase quantity"
                          onClick={() => {
                            if (!lineId) return
                            void updateQuantity(lineId, item.quantity + 1)
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.linePrice}>{formatMoney(linePrice, currency)}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => {
                        if (!lineId) return
                        void removeItem(lineId)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Subtotal</span>
            <span className={styles.totalAmount}>{formatMoney(subtotal, currency)}</span>
          </div>
          <Link
            href="/checkout"
            className={styles.checkoutBtn}
            aria-disabled={items.length === 0}
            onClick={(e) => {
              if (items.length === 0) e.preventDefault()
              else closeDrawer()
            }}
          >
            Checkout
          </Link>
          <p className={styles.fineprint}>
            Taxes and shipping calculated at checkout. Prices locked in {currency}.
          </p>
        </div>
      </aside>
    </>
  )
}
