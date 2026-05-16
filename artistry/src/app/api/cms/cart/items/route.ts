import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

function getCartId(req: NextRequest): string | null {
  return req.cookies.get('cart_id')?.value ?? null
}

function getCustomerToken(req: NextRequest): string | null {
  return req.cookies.get('customer_token')?.value ?? null
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

async function ensureCart(cartId: string, customerToken: string, displayCurrency: 'USD' | 'NGN' = 'USD'): Promise<PayloadCart> {
  let doc = await getCartByCartId(cartId)
  if (!doc) {
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
    if (!res.ok) throw new Error('Failed to create cart')
    doc = await res.json()
  }
  return doc
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  const res = new NextResponse()
  let cartId = getCartId(req)
  let customerToken = getCustomerToken(req)

  if (!customerToken) {
    customerToken = generateId()
    setCustomerTokenCookie(res, customerToken)
  }

  if (!cartId) {
    cartId = generateId()
    setCartIdCookie(res, cartId)
  }

  const body = await req.json()
  const { type, productId, variantId, quantity = 1 } = body as {
    type: 'Track' | 'EP' | 'Merch'
    productId: string | number
    variantId?: string | null
    quantity?: number
  }

  const doc = await ensureCart(cartId, customerToken)
  const items = doc.items ?? []

  // Check if item already exists (match by productId + variantId)
  const existingIndex = items.findIndex(
    (item) => item.productId === String(productId) && (item.variantId ?? null) === (variantId ?? null),
  )

  if (existingIndex >= 0) {
    items[existingIndex].quantity += quantity
  } else {
    items.push({
      _order: items.length,
      id: generateId(),
      type,
      productId: String(productId),
      variantId: variantId ?? null,
      name: body.name ?? '',
      variantLabel: body.variantLabel ?? null,
      sku: body.sku ?? null,
      priceUSD: body.priceUSD ?? 0,
      priceNGN: body.priceNGN ?? 0,
      quantity,
      imageUrl: body.imageUrl ?? null,
    })
  }

  const url = `${API_URL}/carts/${doc.id}`
  const updateRes = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })

  if (!updateRes.ok) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }

  const updated = await updateRes.json()
  return NextResponse.json({ cart: toPublicCart(updated) }, { headers: res.headers })
}

export async function PATCH(req: NextRequest) {
  const cartId = getCartId(req)
  if (!cartId) {
    return NextResponse.json({ error: 'No cart' }, { status: 400 })
  }

  const body = await req.json()
  const { lineId, quantity } = body as { lineId: string; quantity: number }

  const doc = await getCartByCartId(cartId)
  if (!doc) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }

  const items = doc.items ?? []
  const item = items.find((i) => i.id === lineId)
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  item.quantity = Math.max(1, quantity)

  const url = `${API_URL}/carts/${doc.id}`
  const updateRes = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })

  if (!updateRes.ok) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }

  const updated = await updateRes.json()
  return NextResponse.json({ cart: toPublicCart(updated) })
}

export async function DELETE(req: NextRequest) {
  const cartId = getCartId(req)
  if (!cartId) {
    return NextResponse.json({ error: 'No cart' }, { status: 400 })
  }

  const lineId = req.nextUrl.searchParams.get('lineId')
  if (!lineId) {
    return NextResponse.json({ error: 'lineId required' }, { status: 400 })
  }

  const doc = await getCartByCartId(cartId)
  if (!doc) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }

  const items = (doc.items ?? []).filter((i) => i.id !== lineId)

  const url = `${API_URL}/carts/${doc.id}`
  const updateRes = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })

  if (!updateRes.ok) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }

  const updated = await updateRes.json()
  return NextResponse.json({ cart: toPublicCart(updated) })
}
