'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import React, { useEffect, useState } from 'react'

import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import { formatMoney, priceFor, type SupportedCurrency } from '@/lib/money'

import styles from './CheckoutClient.module.css'

type PaymentMethod = 'credo' | 'paypal'

interface FormState {
  email: string
  customerName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const EMPTY_FORM: FormState = {
  email: '',
  customerName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

function shippingPayload(form: FormState) {
  const hasAny = form.line1 || form.city || form.state || form.postalCode || form.country
  if (!hasAny) return undefined
  return {
    line1: form.line1 || undefined,
    line2: form.line2 || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    postalCode: form.postalCode || undefined,
    country: form.country || undefined,
    phone: form.phone || undefined,
  }
}

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

export default function CheckoutClient() {
  const router = useRouter()
  const search = useSearchParams()
  const { cart, loading } = useCart()
  const { currency, setCurrency } = useCurrency()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [payment, setPayment] = useState<PaymentMethod>(currency === 'USD' ? 'paypal' : 'credo')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(search.get('failed') ? 'Your last payment did not complete. Try again.' : null)

  // Keep cart currency aligned with the chosen payment method.
  useEffect(() => {
    const target: SupportedCurrency = payment === 'paypal' ? 'USD' : 'NGN'
    if (currency !== target) void setCurrency(target)
  }, [payment, currency, setCurrency])

  const items = cart?.items ?? []
  const subtotal = items.reduce((sum, item) => sum + priceFor(item, currency) * item.quantity, 0)

  function update<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }
  }

  function validate(): string | null {
    if (!form.customerName.trim()) return 'Please enter your name.'
    if (!isValidEmail(form.email.trim())) return 'Please enter a valid email address.'
    if (items.length === 0) return 'Your cart is empty.'
    return null
  }

  async function startCredo() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/cms/checkout/credo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          customerName: form.customerName.trim(),
          phone: form.phone.trim() || undefined,
          shippingAddress: shippingPayload(form),
        }),
      })
      const body = (await response.json()) as { authorizationUrl?: string; error?: string }
      if (!response.ok || !body.authorizationUrl) {
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }
      window.location.href = body.authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment.')
      setSubmitting(false)
    }
  }

  async function createPaypalOrder(): Promise<string> {
    const err = validate()
    if (err) {
      setError(err)
      throw new Error(err)
    }
    setError(null)
    const response = await fetch('/api/cms/checkout/paypal/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        customerName: form.customerName.trim(),
        phone: form.phone.trim() || undefined,
        shippingAddress: shippingPayload(form),
      }),
    })
    const body = (await response.json()) as { paypalOrderId?: string; error?: string }
    if (!response.ok || !body.paypalOrderId) {
      throw new Error(body.error ?? `HTTP ${response.status}`)
    }
    return body.paypalOrderId
  }

  async function onPaypalApprove(paypalOrderId: string): Promise<void> {
    setSubmitting(true)
    try {
      const response = await fetch('/api/cms/checkout/paypal/capture', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ paypalOrderId }),
      })
      const body = (await response.json()) as { orderNumber?: string; lookupToken?: string; error?: string }
      if (!response.ok || !body.orderNumber) {
        throw new Error(body.error ?? `HTTP ${response.status}`)
      }
      const token = body.lookupToken ? `?t=${encodeURIComponent(body.lookupToken)}` : ''
      router.push(`/orders/${encodeURIComponent(body.orderNumber)}${token}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment capture failed.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.empty}>
        <p>Loading your cart…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty.</h2>
        <p>Add something to checkout.</p>
        <a className="btn btn-gold" href="/shop">Browse shop</a>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <div>
        {error && <div className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Name</label>
              <input
                className={styles.input}
                value={form.customerName}
                onChange={update('customerName')}
                autoComplete="name"
              />
            </div>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input
                className={styles.input}
                value={form.phone}
                onChange={update('phone')}
                autoComplete="tel"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: 0, marginBottom: 12 }}>
            Required for physical merch. Skip if your order is digital-only.
          </p>
          <div className={styles.field} style={{ marginBottom: 12 }}>
            <label className={styles.label}>Address line 1</label>
            <input className={styles.input} value={form.line1} onChange={update('line1')} autoComplete="address-line1" />
          </div>
          <div className={styles.field} style={{ marginBottom: 12 }}>
            <label className={styles.label}>Address line 2</label>
            <input className={styles.input} value={form.line2} onChange={update('line2')} autoComplete="address-line2" />
          </div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input className={styles.input} value={form.city} onChange={update('city')} autoComplete="address-level2" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State / Region</label>
              <input className={styles.input} value={form.state} onChange={update('state')} autoComplete="address-level1" />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Postal code</label>
              <input className={styles.input} value={form.postalCode} onChange={update('postalCode')} autoComplete="postal-code" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Country</label>
              <input className={styles.input} value={form.country} onChange={update('country')} autoComplete="country-name" />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Payment</h2>
          <div className={styles.paymentTabs} role="radiogroup" aria-label="Payment method">
            <button
              type="button"
              className={styles.paymentTab}
              data-active={payment === 'credo'}
              role="radio"
              aria-checked={payment === 'credo'}
              onClick={() => setPayment('credo')}
            >
              <span className={styles.paymentTabLabel}>Credo</span>
              <span className={styles.paymentTabHint}>Card, bank, USSD — charged in NGN</span>
            </button>
            <button
              type="button"
              className={styles.paymentTab}
              data-active={payment === 'paypal'}
              role="radio"
              aria-checked={payment === 'paypal'}
              onClick={() => setPayment('paypal')}
            >
              <span className={styles.paymentTabLabel}>PayPal</span>
              <span className={styles.paymentTabHint}>Card or PayPal balance — charged in USD</span>
            </button>
          </div>

          {payment === 'credo' && (
            <button
              type="button"
              className={styles.payCredoBtn}
              onClick={() => void startCredo()}
              disabled={submitting}
            >
              {submitting ? 'Redirecting…' : `Pay ${formatMoney(subtotal, currency)} with Credo`}
            </button>
          )}

          {payment === 'paypal' && (
            <div className={styles.paypalShell}>
              {PAYPAL_CLIENT_ID ? (
                <PayPalScriptProvider
                  options={{
                    clientId: PAYPAL_CLIENT_ID,
                    currency: 'USD',
                    intent: 'capture',
                    components: 'buttons',
                  }}
                >
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                    disabled={submitting}
                    createOrder={async () => createPaypalOrder()}
                    onApprove={async (data) => {
                      if (!data.orderID) {
                        setError('PayPal did not return an order ID.')
                        return
                      }
                      await onPaypalApprove(data.orderID)
                    }}
                    onError={(err) => {
                      const message = err instanceof Error ? err.message : 'PayPal error.'
                      setError(message)
                    }}
                    onCancel={() => {
                      setError('Payment cancelled.')
                    }}
                  />
                </PayPalScriptProvider>
              ) : (
                <p className={styles.paypalUnconfigured}>
                  PayPal isn&apos;t configured on this environment. Set <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to enable.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <aside className={styles.summary}>
        <h2 className={styles.sectionTitle}>Order summary</h2>
        {items.map((item) => {
          const lineTotal = priceFor(item, currency) * item.quantity
          return (
            <div key={item.lineId ?? `${item.productId}-${item.variantId ?? ''}`} className={styles.line}>
              <div
                className={styles.lineImg}
                style={item.imageUrl ? { backgroundImage: `url('${item.imageUrl}')` } : undefined}
              />
              <div>
                <div className={styles.lineName}>{item.name}</div>
                <div className={styles.lineSub}>
                  {item.variantLabel ?? null}
                  {item.variantLabel ? ' · ' : ''}× {item.quantity}
                </div>
              </div>
              <div className={styles.linePrice}>{formatMoney(lineTotal, currency)}</div>
            </div>
          )
        })}
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>{formatMoney(subtotal, currency)}</span>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 8 }}>
          Charged in {currency}. Switching payment method updates pricing.
        </p>
      </aside>
    </div>
  )
}
