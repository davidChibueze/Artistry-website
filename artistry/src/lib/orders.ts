import type { SupportedCurrency } from './money'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export interface PublicOrderItem {
  type?: 'Track' | 'EP' | 'Merch' | null
  productId?: string | null
  variantId?: string | null
  name?: string | null
  variantLabel?: string | null
  sku?: string | null
  quantity?: number | null
  priceUSD?: number | null
  priceNGN?: number | null
}

export interface PublicOrder {
  orderNumber: string
  status: string | null
  displayCurrency: SupportedCurrency
  subtotal: number | null
  shipping: number | null
  total: number | null
  customerName: string | null
  customerEmail: string | null
  items: PublicOrderItem[]
  shippingAddress: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  } | null
  paymentProvider: 'credo' | 'paypal' | null
  paidCurrency: SupportedCurrency | null
  paidAmount: number | null
  createdAt: string | null
  lookupUrl: string
  downloadUrl: string | null
  downloadExpiresAt: string | null
}

export interface PublicOrderSummary {
  orderNumber: string
  status: string | null
  displayCurrency: SupportedCurrency
  total: number | null
  createdAt: string | null
  lookupUrl: string
}

export async function fetchOrderByToken(
  orderNumber: string,
  token: string,
): Promise<PublicOrder | null> {
  const url = `${API_URL}/orders/by-token?orderNumber=${encodeURIComponent(orderNumber)}&t=${encodeURIComponent(token)}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) return null
  const body = (await response.json()) as { order?: PublicOrder }
  return body.order ?? null
}

export async function fetchOrderByMagicLink(token: string): Promise<PublicOrder | null> {
  const url = `${API_URL}/orders/by-magic-link?token=${encodeURIComponent(token)}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) return null
  const body = (await response.json()) as { order?: PublicOrder }
  return body.order ?? null
}

export async function fetchOrdersByCustomerToken(
  customerToken: string,
): Promise<PublicOrderSummary[]> {
  const response = await fetch(`${API_URL}/orders/by-customer`, {
    cache: 'no-store',
    headers: { cookie: `customer_token=${customerToken}` },
  })
  if (!response.ok) return []
  const body = (await response.json()) as { orders?: PublicOrderSummary[] }
  return body.orders ?? []
}
