import type { Payload } from 'payload'

import type { Cart, MerchProduct, Release } from '../../payload-types'
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '../../utilities/currency'

export type CartItemType = 'Track' | 'EP' | 'Merch'

export interface AddItemInput {
  type: CartItemType
  productId: string | number
  variantId?: string | null
  quantity?: number
}

export interface SnapshotItem {
  type: CartItemType
  productId: string
  variantId?: string | null
  name: string
  variantLabel?: string | null
  sku?: string | null
  priceUSD: number
  priceNGN: number
  imageUrl?: string | null
  quantity: number
}

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as string[]).includes(value)
}

function getMediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null
  const url = (media as { url?: string }).url
  return url ?? null
}

export async function findCartByCookieId(payload: Payload, cartId: string): Promise<Cart | null> {
  const result = await payload.find({
    collection: 'carts',
    where: { cartId: { equals: cartId } },
    limit: 1,
  })
  return (result.docs[0] as Cart | undefined) ?? null
}

export async function getOrCreateCart(
  payload: Payload,
  args: {
    cartId: string
    customerToken: string
    displayCurrency: SupportedCurrency
  },
): Promise<Cart> {
  const existing = await findCartByCookieId(payload, args.cartId)
  if (existing) return existing

  const created = await payload.create({
    collection: 'carts',
    data: {
      cartId: args.cartId,
      customerToken: args.customerToken,
      displayCurrency: args.displayCurrency,
      items: [],
    },
  })
  return created as Cart
}

export async function snapshotMerchItem(
  payload: Payload,
  input: AddItemInput,
): Promise<SnapshotItem> {
  const product = (await payload.findByID({
    collection: 'merch-products',
    id: input.productId,
    depth: 1,
  })) as MerchProduct

  if (!product.inStock) {
    throw new HttpError(409, 'Product is unavailable.')
  }

  const variants = product.variants ?? []
  let variantLabel: string | null = null
  let sku: string | null = null
  let priceUSD = product.priceUSD
  let priceNGN = product.priceNGN
  let imageUrl: string | null = null
  let variantIdOut: string | null = null

  if (variants.length > 0) {
    if (!input.variantId) {
      throw new HttpError(400, 'This product requires a variant selection.')
    }
    const variant = variants.find((v) => String(v.id) === String(input.variantId))
    if (!variant) throw new HttpError(404, 'Variant not found.')
    if (!variant.available) throw new HttpError(409, 'Variant is unavailable.')
    if ((variant.stock ?? 0) < (input.quantity ?? 1)) {
      throw new HttpError(409, 'Not enough stock for the requested quantity.')
    }
    priceUSD = variant.priceUSD
    priceNGN = variant.priceNGN
    sku = variant.sku ?? null
    variantIdOut = String(variant.id)
    variantLabel =
      (variant.optionValues ?? [])
        .map((opt) => `${opt.type}: ${opt.value}`)
        .join(' / ') || null
    imageUrl = getMediaUrl(variant.image)
  }

  if (!imageUrl) {
    const firstImage = product.images?.[0]?.image
    imageUrl = getMediaUrl(firstImage)
  }

  if (priceUSD == null || priceNGN == null) {
    throw new HttpError(500, 'Product is missing pricing.')
  }

  return {
    type: 'Merch',
    productId: String(product.id),
    variantId: variantIdOut,
    name: product.name,
    variantLabel,
    sku,
    priceUSD,
    priceNGN,
    imageUrl,
    quantity: Math.max(1, input.quantity ?? 1),
  }
}

export async function snapshotTrackItem(
  payload: Payload,
  input: AddItemInput,
): Promise<SnapshotItem> {
  const release = (await payload.findByID({
    collection: 'releases',
    id: input.productId,
    depth: 1,
  })) as Release

  if (input.type === 'Track') {
    if (!input.variantId) throw new HttpError(400, 'Track selection required.')
    const track = (release.tracks ?? []).find((t) => String(t.id) === String(input.variantId))
    if (!track) throw new HttpError(404, 'Track not found.')
    if (track.priceUSD == null || track.priceNGN == null) {
      throw new HttpError(409, 'This track is not for sale.')
    }
    return {
      type: 'Track',
      productId: String(release.id),
      variantId: String(track.id),
      name: track.title ?? release.title,
      variantLabel: release.title,
      sku: null,
      priceUSD: track.priceUSD,
      priceNGN: track.priceNGN,
      imageUrl: getMediaUrl(release.coverImage),
      quantity: 1,
    }
  }

  // EP / Album purchase via distributionTier selection
  if (!input.variantId) throw new HttpError(400, 'Bundle tier selection required.')
  const tier = (release.distributionTiers ?? []).find(
    (t) => String(t.id) === String(input.variantId),
  )
  if (!tier) throw new HttpError(404, 'Distribution tier not found.')
  if (tier.priceUSD == null || tier.priceNGN == null) {
    throw new HttpError(409, 'This tier is not for sale.')
  }
  return {
    type: 'EP',
    productId: String(release.id),
    variantId: String(tier.id),
    name: release.title,
    variantLabel: tier.label ?? null,
    sku: null,
    priceUSD: tier.priceUSD,
    priceNGN: tier.priceNGN,
    imageUrl: getMediaUrl(release.coverImage),
    quantity: 1,
  }
}

export async function snapshotItem(
  payload: Payload,
  input: AddItemInput,
): Promise<SnapshotItem> {
  switch (input.type) {
    case 'Merch':
      return snapshotMerchItem(payload, input)
    case 'Track':
    case 'EP':
      return snapshotTrackItem(payload, input)
    default:
      throw new HttpError(400, `Unsupported item type: ${input.type}`)
  }
}

export function findLineIndex(cart: Cart, lineId: string): number {
  const items = cart.items ?? []
  return items.findIndex((item) => String(item.id) === String(lineId))
}

export function mergeQuantityIfExists(
  cart: Cart,
  snapshot: SnapshotItem,
): { merged: boolean; items: Cart['items'] } {
  const items = [...(cart.items ?? [])]
  const idx = items.findIndex(
    (item) =>
      item.productId === snapshot.productId &&
      (item.variantId ?? null) === (snapshot.variantId ?? null) &&
      item.type === snapshot.type,
  )
  if (idx === -1) return { merged: false, items }
  items[idx] = {
    ...items[idx],
    quantity: (items[idx].quantity ?? 1) + snapshot.quantity,
  }
  return { merged: true, items }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status })
  }
  // eslint-disable-next-line no-console
  console.error('Cart endpoint error', err)
  return Response.json({ error: 'Internal error' }, { status: 500 })
}

export function publicCart(cart: Cart) {
  return {
    cartId: cart.cartId,
    displayCurrency: cart.displayCurrency,
    customerEmail: cart.customerEmail,
    items: (cart.items ?? []).map((item) => ({
      lineId: item.id,
      type: item.type,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variantLabel: item.variantLabel,
      sku: item.sku,
      priceUSD: item.priceUSD,
      priceNGN: item.priceNGN,
      imageUrl: item.imageUrl,
      quantity: item.quantity ?? 1,
    })),
    itemCount: cart.itemCount,
    subtotal: (cart.items ?? []).reduce((sum, item) => {
      const price =
        cart.displayCurrency === 'NGN' ? item.priceNGN ?? 0 : item.priceUSD ?? 0
      return sum + price * (item.quantity ?? 1)
    }, 0),
  }
}
