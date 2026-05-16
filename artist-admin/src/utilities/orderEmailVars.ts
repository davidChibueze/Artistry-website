import type { Order } from '../payload-types'

import { formatMoney, type SupportedCurrency } from './currency'

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'https://poshbugati.com'
  ).replace(/\/$/, '')
}

export function buildOrderLookupUrl(order: Pick<Order, 'orderNumber' | 'lookupToken'>): string {
  const base = getSiteUrl()
  const params = new URLSearchParams()
  if (order.lookupToken) params.set('t', order.lookupToken)
  const qs = params.toString()
  return `${base}/orders/${encodeURIComponent(order.orderNumber ?? '')}${qs ? `?${qs}` : ''}`
}

export function buildDownloadUrl(order: Pick<Order, 'orderNumber' | 'downloadToken'>): string {
  if (!order.downloadToken) return ''
  return `${getSiteUrl()}/orders/${encodeURIComponent(order.orderNumber ?? '')}/download?t=${order.downloadToken}`
}

function renderItemsList(order: Order): { text: string; html: string } {
  const items = order.items ?? []
  if (items.length === 0) return { text: '', html: '' }

  const currency = (order.displayCurrency ?? 'USD') as SupportedCurrency

  const lines = items.map((item) => {
    const price = currency === 'NGN' ? item.priceNGN ?? 0 : item.priceUSD ?? 0
    const qty = item.quantity ?? 1
    const lineTotal = formatMoney(price * qty, currency)
    const variantSuffix = item.variantLabel ? ` (${item.variantLabel})` : ''
    return {
      text: `• ${item.name ?? ''}${variantSuffix} × ${qty} — ${lineTotal}`,
      html: `<li>${escapeHtml(item.name ?? '')}${variantSuffix ? ` <em>${escapeHtml(item.variantLabel ?? '')}</em>` : ''} × ${qty} — ${escapeHtml(lineTotal)}</li>`,
    }
  })

  return {
    text: lines.map((l) => l.text).join('\n'),
    html: `<ul>${lines.map((l) => l.html).join('')}</ul>`,
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return ch
    }
  })
}

export function buildOrderVars(order: Order): Record<string, string> {
  const currency = (order.displayCurrency ?? 'USD') as SupportedCurrency
  const items = renderItemsList(order)

  return {
    customerName: order.customerName ?? '',
    orderNumber: order.orderNumber ?? '',
    orderTotal: formatMoney(order.total ?? 0, currency),
    currency,
    itemsList: items.text,
    itemsListHtml: items.html,
    lookupUrl: buildOrderLookupUrl(order),
    downloadUrl: buildDownloadUrl(order),
  }
}
