import type { Endpoint } from 'payload'

import {
  buildCartCookie,
  buildCustomerCookie,
  generateCartId,
  generateCustomerToken,
  getCartIdFromRequest,
  getCustomerTokenFromRequest,
  withSetCookies,
} from '../../utilities/cartCookie'
import { buildCurrencyCookie, detectCurrency } from '../../utilities/currency'
import type { Cart } from '../../payload-types'
import {
  errorResponse,
  findLineIndex,
  getOrCreateCart,
  HttpError,
  isSupportedCurrency,
  mergeQuantityIfExists,
  publicCart,
  snapshotItem,
} from './lib'

type CartItemsInput = Cart['items']

async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    throw new HttpError(400, 'Invalid JSON body.')
  }
}

function ensureCookies(headers: Headers): { cartId: string; customerToken: string; isNew: boolean } {
  const existingCart = getCartIdFromRequest(headers)
  const existingCustomer = getCustomerTokenFromRequest(headers)
  return {
    cartId: existingCart ?? generateCartId(),
    customerToken: existingCustomer ?? generateCustomerToken(),
    isNew: !existingCart || !existingCustomer,
  }
}

function setCookiesIfNeeded(
  res: Response,
  reqHeaders: Headers,
  cartId: string,
  customerToken: string,
): Response {
  const cookies: string[] = []
  if (!getCartIdFromRequest(reqHeaders)) cookies.push(buildCartCookie(cartId, reqHeaders))
  if (!getCustomerTokenFromRequest(reqHeaders)) {
    cookies.push(buildCustomerCookie(customerToken, reqHeaders))
  }
  return cookies.length ? withSetCookies(res, cookies) : res
}

export const getCart: Endpoint = {
  path: '/cart',
  method: 'get',
  handler: async (req) => {
    try {
      const { cartId, customerToken } = ensureCookies(req.headers)
      const displayCurrency = detectCurrency(req)
      const cart = await getOrCreateCart(req.payload, {
        cartId,
        customerToken,
        displayCurrency,
      })
      const res = Response.json({ cart: publicCart(cart) })
      return setCookiesIfNeeded(res, req.headers, cartId, customerToken)
    } catch (err) {
      return errorResponse(err)
    }
  },
}

export const addCartItem: Endpoint = {
  path: '/cart/items',
  method: 'post',
  handler: async (req) => {
    try {
      const { cartId, customerToken } = ensureCookies(req.headers)
      const displayCurrency = detectCurrency(req)
      const cart = await getOrCreateCart(req.payload, {
        cartId,
        customerToken,
        displayCurrency,
      })
      const body = await readJson<{
        type?: string
        productId?: string | number
        variantId?: string | null
        quantity?: number
      }>(req as unknown as Request)

      if (!body.type || !body.productId) {
        throw new HttpError(400, 'type and productId are required.')
      }
      if (!['Track', 'EP', 'Merch'].includes(body.type)) {
        throw new HttpError(400, `Unsupported item type: ${body.type}`)
      }

      const snapshot = await snapshotItem(req.payload, {
        type: body.type as 'Track' | 'EP' | 'Merch',
        productId: body.productId,
        variantId: body.variantId ?? null,
        quantity: body.quantity ?? 1,
      })

      const { merged, items } = mergeQuantityIfExists(cart, snapshot)
      const nextItems = merged
        ? items
        : [
            ...(cart.items ?? []),
            {
              type: snapshot.type,
              productId: snapshot.productId,
              variantId: snapshot.variantId,
              name: snapshot.name,
              variantLabel: snapshot.variantLabel,
              sku: snapshot.sku,
              priceUSD: snapshot.priceUSD,
              priceNGN: snapshot.priceNGN,
              imageUrl: snapshot.imageUrl,
              quantity: snapshot.quantity,
            },
          ]

      const updated = await req.payload.update({
        collection: 'carts',
        id: cart.id,
        data: { items: nextItems as CartItemsInput },
      })

      const res = Response.json({ cart: publicCart(updated as typeof cart) }, { status: 200 })
      return setCookiesIfNeeded(res, req.headers, cartId, customerToken)
    } catch (err) {
      return errorResponse(err)
    }
  },
}

export const updateCartItem: Endpoint = {
  path: '/cart/items',
  method: 'patch',
  handler: async (req) => {
    try {
      const { cartId, customerToken } = ensureCookies(req.headers)
      const displayCurrency = detectCurrency(req)
      const cart = await getOrCreateCart(req.payload, {
        cartId,
        customerToken,
        displayCurrency,
      })
      const body = await readJson<{ lineId?: string; quantity?: number }>(req as unknown as Request)
      if (!body.lineId) throw new HttpError(400, 'lineId is required.')
      if (body.quantity == null || body.quantity < 0) {
        throw new HttpError(400, 'quantity must be >= 0.')
      }

      const idx = findLineIndex(cart, body.lineId)
      if (idx === -1) throw new HttpError(404, 'Cart line not found.')

      const items = [...(cart.items ?? [])]
      if (body.quantity === 0) {
        items.splice(idx, 1)
      } else {
        items[idx] = { ...items[idx], quantity: body.quantity }
      }

      const updated = await req.payload.update({
        collection: 'carts',
        id: cart.id,
        data: { items: items as CartItemsInput },
      })

      const res = Response.json({ cart: publicCart(updated as typeof cart) })
      return setCookiesIfNeeded(res, req.headers, cartId, customerToken)
    } catch (err) {
      return errorResponse(err)
    }
  },
}

export const removeCartItem: Endpoint = {
  path: '/cart/items',
  method: 'delete',
  handler: async (req) => {
    try {
      const { cartId, customerToken } = ensureCookies(req.headers)
      const displayCurrency = detectCurrency(req)
      const cart = await getOrCreateCart(req.payload, {
        cartId,
        customerToken,
        displayCurrency,
      })

      const url = new URL(req.url || 'http://localhost')
      let lineId = url.searchParams.get('lineId')
      if (!lineId) {
        try {
          const body = await readJson<{ lineId?: string }>(req as unknown as Request)
          lineId = body.lineId ?? null
        } catch {
          // ignore — body might be empty for DELETE
        }
      }
      if (!lineId) throw new HttpError(400, 'lineId is required.')

      const idx = findLineIndex(cart, lineId)
      if (idx === -1) throw new HttpError(404, 'Cart line not found.')

      const items = [...(cart.items ?? [])]
      items.splice(idx, 1)

      const updated = await req.payload.update({
        collection: 'carts',
        id: cart.id,
        data: { items: items as CartItemsInput },
      })

      const res = Response.json({ cart: publicCart(updated as typeof cart) })
      return setCookiesIfNeeded(res, req.headers, cartId, customerToken)
    } catch (err) {
      return errorResponse(err)
    }
  },
}

export const setCartCurrency: Endpoint = {
  path: '/cart/currency',
  method: 'post',
  handler: async (req) => {
    try {
      const { cartId, customerToken } = ensureCookies(req.headers)
      const body = await readJson<{ currency?: string }>(req as unknown as Request)
      if (!isSupportedCurrency(body.currency)) {
        throw new HttpError(400, 'Unsupported currency.')
      }
      const cart = await getOrCreateCart(req.payload, {
        cartId,
        customerToken,
        displayCurrency: body.currency,
      })

      const updated = await req.payload.update({
        collection: 'carts',
        id: cart.id,
        data: { displayCurrency: body.currency },
      })

      const res = Response.json({ cart: publicCart(updated as typeof cart) })
      const cookies = [buildCurrencyCookie(body.currency)]
      if (!getCartIdFromRequest(req.headers)) cookies.push(buildCartCookie(cartId, req.headers))
      if (!getCustomerTokenFromRequest(req.headers)) {
        cookies.push(buildCustomerCookie(customerToken, req.headers))
      }
      return withSetCookies(res, cookies)
    } catch (err) {
      return errorResponse(err)
    }
  },
}

export const setCartEmail: Endpoint = {
  path: '/cart/email',
  method: 'post',
  handler: async (req) => {
    try {
      const { cartId, customerToken } = ensureCookies(req.headers)
      const displayCurrency = detectCurrency(req)
      const cart = await getOrCreateCart(req.payload, {
        cartId,
        customerToken,
        displayCurrency,
      })
      const body = await readJson<{ email?: string }>(req as unknown as Request)
      const email = body.email?.trim().toLowerCase()
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new HttpError(400, 'A valid email is required.')
      }
      const updated = await req.payload.update({
        collection: 'carts',
        id: cart.id,
        data: { customerEmail: email },
      })
      const res = Response.json({ cart: publicCart(updated as typeof cart) })
      return setCookiesIfNeeded(res, req.headers, cartId, customerToken)
    } catch (err) {
      return errorResponse(err)
    }
  },
}

export const cartEndpoints: Endpoint[] = [
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  setCartCurrency,
  setCartEmail,
]
