import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

function getCartId(req: NextRequest): string | null {
  return req.cookies.get('cart_id')?.value ?? null
}

function setCartIdCookie(res: NextResponse, cartId: string) {
  res.cookies.set('cart_id', cartId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

function setCustomerTokenCookie(res: NextResponse, token: string) {
  res.cookies.set('customer_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

interface CartItem {
  _order: number
  id: string
  type: 'Track' | 'EP' | 'Merch'
  productId: string
  variantId?: string | null
  name?: string
  variantLabel?: string | null
  sku?: string | null
  priceUSD: number
  priceNGN: number
  quantity: number
  imageUrl?: string | null
}

interface PayloadCart {
  id: number
  cartId: string
  customerEmail?: string | null
  customerToken?: string | null
  displayCurrency: 'USD' | 'NGN'
  items?: CartItem[]
  itemCount: number
}

interface PayloadListResponse {
  docs: PayloadCart[]
  totalDocs: number
}

function toPublicCart(doc: PayloadCart) {
  const items = (doc.items ?? []).map((item) => ({
    lineId: item.id,
    type: item.type,
    productId: item.productId,
    variantId: item.variantId ?? null,
    name: item.name ?? '',
    variantLabel: item.variantLabel ?? null,
    sku: item.sku ?? null,
    priceUSD: item.priceUSD,
    priceNGN: item.priceNGN,
    imageUrl: item.imageUrl ?? null,
    quantity: item.quantity,
  }))

  const subtotal = items.reduce(
    (sum, item) => sum + item.priceUSD * item.quantity,
    0,
  )

  return {
    cartId: doc.cartId,
    displayCurrency: doc.displayCurrency,
    customerEmail: doc.customerEmail ?? null,
    items,
    itemCount: doc.itemCount,
    subtotal,
  }
}

async function getCartByCartId(cartId: string): Promise<PayloadCart | null> {
  const url = `${API_URL}/carts?where[cartId][equals]=${encodeURIComponent(cartId)}&limit=1&depth=0`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  const body: PayloadListResponse = await res.json()
  return body.docs[0] ?? null
}

async function createCart(cartId: string, customerToken: string, displayCurrency: 'USD' | 'NGN' = 'USD'): Promise<PayloadCart | null> {
  const url = `${API_URL}/carts`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cartId,
      customerToken,
      displayCurrency,
      items: [],
    }),
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET(req: NextRequest) {
  const cartId = getCartId(req)
  if (!cartId) {
    return NextResponse.json({ cart: null })
  }

  const doc = await getCartByCartId(cartId)
  if (!doc) {
    return NextResponse.json({ cart: null })
  }

  return NextResponse.json({ cart: toPublicCart(doc) })
}
