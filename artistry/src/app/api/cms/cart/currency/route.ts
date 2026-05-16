import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

function getCartId(req: NextRequest): string | null {
  return req.cookies.get('cart_id')?.value ?? null
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

export async function POST(req: NextRequest) {
  const cartId = getCartId(req)
  if (!cartId) {
    return NextResponse.json({ error: 'No cart' }, { status: 400 })
  }

  const body = await req.json()
  const { currency } = body as { currency: 'USD' | 'NGN' }

  const doc = await getCartByCartId(cartId)
  if (!doc) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }

  const url = `${API_URL}/carts/${doc.id}`
  const updateRes = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayCurrency: currency }),
  })

  if (!updateRes.ok) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }

  const updated = await updateRes.json()
  return NextResponse.json({ cart: toPublicCart(updated) })
}
