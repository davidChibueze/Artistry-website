import type { Order } from '../../payload-types'

import { buildDownloadUrl, buildOrderLookupUrl } from '../../utilities/orderEmailVars'

const ELIGIBLE_FOR_DOWNLOAD = new Set(['Paid', 'Fulfilled'])

function downloadStillValid(order: Order): boolean {
  if (!order.downloadToken || !order.downloadExpiresAt) return false
  return new Date(order.downloadExpiresAt).getTime() > Date.now()
}

/**
 * Customer-safe representation of an Order. Strips internal tokens, notes,
 * email logs, raw payment references, etc.
 */
export function publicOrder(order: Order) {
  const includeDownload =
    ELIGIBLE_FOR_DOWNLOAD.has(order.status ?? '') && downloadStillValid(order)

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    displayCurrency: order.displayCurrency,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: (order.items ?? []).map((item) => ({
      type: item.type,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variantLabel: item.variantLabel,
      sku: item.sku,
      quantity: item.quantity,
      priceUSD: item.priceUSD,
      priceNGN: item.priceNGN,
    })),
    shippingAddress: order.shippingAddress
      ? {
          line1: order.shippingAddress.line1,
          line2: order.shippingAddress.line2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        }
      : null,
    paymentProvider: order.paymentProvider,
    paidCurrency: order.paidCurrency,
    paidAmount: order.paidAmount,
    createdAt: order.createdAt,
    lookupUrl: buildOrderLookupUrl(order),
    downloadUrl: includeDownload ? buildDownloadUrl(order) : null,
    downloadExpiresAt: includeDownload ? order.downloadExpiresAt : null,
  }
}

export type PublicOrder = ReturnType<typeof publicOrder>
