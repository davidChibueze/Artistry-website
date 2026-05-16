import type { Payload, PayloadRequest } from 'payload'

import type { Cart, MerchProduct, Order, Release } from '../../payload-types'
import type { SupportedCurrency } from '../../utilities/currency'
import { HttpError } from '../cart/lib'

export interface CheckoutCustomerInput {
  email: string
  customerName: string
  phone?: string
  shippingAddress?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
  }
}

export interface ValidatedLine {
  type: 'Track' | 'EP' | 'Merch'
  productId: string
  variantId?: string | null
  name: string
  variantLabel?: string | null
  sku?: string | null
  priceUSD: number
  priceNGN: number
  quantity: number
}

function priceFromCurrency(line: { priceUSD: number; priceNGN: number }, currency: SupportedCurrency) {
  return currency === 'NGN' ? line.priceNGN : line.priceUSD
}

export function validateCustomer(input: Partial<CheckoutCustomerInput>): CheckoutCustomerInput {
  const email = input.email?.trim().toLowerCase()
  const customerName = input.customerName?.trim()
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new HttpError(400, 'A valid email is required.')
  }
  if (!customerName) {
    throw new HttpError(400, 'customerName is required.')
  }
  return {
    email,
    customerName,
    phone: input.phone?.trim() || undefined,
    shippingAddress: input.shippingAddress,
  }
}

/**
 * Re-resolves every cart line against the current product DB to:
 *  - block stale or tampered prices (customer never gets to set their own number)
 *  - block out-of-stock purchases
 *  - refresh names/labels if the admin edited the product mid-session
 */
export async function revalidateCartLines(
  payload: Payload,
  cart: Cart,
): Promise<ValidatedLine[]> {
  const items = cart.items ?? []
  if (items.length === 0) throw new HttpError(400, 'Your cart is empty.')

  const lines: ValidatedLine[] = []

  for (const item of items) {
    if (!item.type || !item.productId) {
      throw new HttpError(409, 'A cart item is missing required references.')
    }
    const quantity = Math.max(1, item.quantity ?? 1)

    if (item.type === 'Merch') {
      const product = (await payload.findByID({
        collection: 'merch-products',
        id: item.productId,
      })) as MerchProduct
      if (!product.inStock) {
        throw new HttpError(409, `${product.name} is no longer available.`)
      }
      const variants = product.variants ?? []

      if (variants.length > 0) {
        const variant = variants.find((v) => String(v.id) === String(item.variantId))
        if (!variant) throw new HttpError(409, `Selected variant no longer exists for ${product.name}.`)
        if (!variant.available) {
          throw new HttpError(409, `Selected variant is no longer available for ${product.name}.`)
        }
        if ((variant.stock ?? 0) < quantity) {
          throw new HttpError(409, `Not enough stock for ${product.name}.`)
        }
        if (variant.priceUSD == null || variant.priceNGN == null) {
          throw new HttpError(409, `Pricing missing for a variant of ${product.name}.`)
        }
        lines.push({
          type: 'Merch',
          productId: String(product.id),
          variantId: String(variant.id),
          name: product.name,
          variantLabel:
            (variant.optionValues ?? []).map((o) => `${o.type}: ${o.value}`).join(' / ') || null,
          sku: variant.sku ?? null,
          priceUSD: variant.priceUSD,
          priceNGN: variant.priceNGN,
          quantity,
        })
      } else {
        if (product.priceUSD == null || product.priceNGN == null) {
          throw new HttpError(409, `Pricing missing for ${product.name}.`)
        }
        lines.push({
          type: 'Merch',
          productId: String(product.id),
          variantId: null,
          name: product.name,
          variantLabel: null,
          sku: null,
          priceUSD: product.priceUSD,
          priceNGN: product.priceNGN,
          quantity,
        })
      }
      continue
    }

    const release = (await payload.findByID({
      collection: 'releases',
      id: item.productId,
    })) as Release

    if (item.type === 'Track') {
      const track = (release.tracks ?? []).find((t) => String(t.id) === String(item.variantId))
      if (!track || track.priceUSD == null || track.priceNGN == null) {
        throw new HttpError(409, `Track no longer available on ${release.title}.`)
      }
      lines.push({
        type: 'Track',
        productId: String(release.id),
        variantId: String(track.id),
        name: track.title ?? release.title,
        variantLabel: release.title,
        sku: null,
        priceUSD: track.priceUSD,
        priceNGN: track.priceNGN,
        quantity: 1,
      })
      continue
    }

    if (item.type === 'EP') {
      const tier = (release.distributionTiers ?? []).find(
        (t) => String(t.id) === String(item.variantId),
      )
      if (!tier || tier.priceUSD == null || tier.priceNGN == null) {
        throw new HttpError(409, `Bundle tier no longer available for ${release.title}.`)
      }
      lines.push({
        type: 'EP',
        productId: String(release.id),
        variantId: String(tier.id),
        name: release.title,
        variantLabel: tier.label ?? null,
        sku: null,
        priceUSD: tier.priceUSD,
        priceNGN: tier.priceNGN,
        quantity: 1,
      })
      continue
    }

    throw new HttpError(400, `Unsupported item type: ${item.type}`)
  }

  return lines
}

export function computeTotals(lines: ValidatedLine[], currency: SupportedCurrency) {
  const subtotal = lines.reduce(
    (sum, line) => sum + priceFromCurrency(line, currency) * line.quantity,
    0,
  )
  return { subtotal, shipping: 0, total: subtotal }
}

export async function createPendingOrder(
  payload: Payload,
  args: {
    cart: Cart
    customer: CheckoutCustomerInput
    lines: ValidatedLine[]
    displayCurrency: SupportedCurrency
    paymentProvider: 'credo' | 'paypal'
    req?: PayloadRequest
  },
): Promise<Order> {
  const totals = computeTotals(args.lines, args.displayCurrency)

  const order = await payload.create({
    collection: 'orders',
    data: {
      customerEmail: args.customer.email,
      customerName: args.customer.customerName,
      shippingAddress: args.customer.shippingAddress
        ? {
            line1: args.customer.shippingAddress.line1,
            line2: args.customer.shippingAddress.line2,
            city: args.customer.shippingAddress.city,
            state: args.customer.shippingAddress.state,
            postalCode: args.customer.shippingAddress.postalCode,
            country: args.customer.shippingAddress.country,
            phone: args.customer.shippingAddress.phone ?? args.customer.phone,
          }
        : undefined,
      items: args.lines.map((line) => ({
        type: line.type,
        productId: line.productId,
        variantId: line.variantId,
        name: line.name,
        variantLabel: line.variantLabel,
        sku: line.sku,
        priceUSD: line.priceUSD,
        priceNGN: line.priceNGN,
        quantity: line.quantity,
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      displayCurrency: args.displayCurrency,
      status: 'Pending Payment',
      paymentProvider: args.paymentProvider,
      customerToken: args.cart.customerToken ?? null,
    },
    req: args.req,
  })
  return order as Order
}

export async function clearCartAfterCheckout(payload: Payload, cartId: number): Promise<void> {
  await payload.update({
    collection: 'carts',
    id: cartId,
    data: { items: [] },
  })
}
