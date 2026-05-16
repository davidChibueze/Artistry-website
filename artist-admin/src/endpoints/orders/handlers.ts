import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'
import crypto from 'crypto'

import { logger } from '../../lib/logger'
import { getCustomerTokenFromRequest } from '../../utilities/cartCookie'
import { describeTtl, signMagicLink, verifyMagicLink } from '../../utilities/magicLink'
import { buildOrderLookupUrl, getSiteUrl } from '../../utilities/orderEmailVars'
import { sendTemplated } from '../../utilities/sendTemplated'
import { errorResponse, HttpError } from '../cart/lib'
import type { Order } from '../../payload-types'
import { publicOrder } from './lib'

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export const orderByToken: Endpoint = {
  path: '/orders/by-token',
  method: 'get',
  handler: async (req) => {
    try {
      const url = new URL(req.url || 'http://localhost')
      const orderNumber = url.searchParams.get('orderNumber')
      const token = url.searchParams.get('t')
      if (!orderNumber || !token) {
        throw new HttpError(400, 'orderNumber and t are required.')
      }

      const result = await req.payload.find({
        collection: 'orders',
        where: { orderNumber: { equals: orderNumber } },
        limit: 1,
      })
      const order = result.docs[0] as Order | undefined
      if (!order || !order.lookupToken) {
        throw new HttpError(404, 'Order not found.')
      }
      if (!timingSafeStringEqual(order.lookupToken, token)) {
        throw new HttpError(404, 'Order not found.')
      }

      return Response.json({ order: publicOrder(order) })
    } catch (err) {
      if (!(err instanceof HttpError)) {
        logger.error({ err }, 'orders.by-token failed')
        Sentry.captureException(err, { tags: { endpoint: 'orders-by-token' } })
      }
      return errorResponse(err)
    }
  },
}

export const orderRequestMagicLink: Endpoint = {
  path: '/orders/request-magic-link',
  method: 'post',
  handler: async (req) => {
    // Always return 200 so this endpoint cannot be used to enumerate which
    // (email, orderNumber) pairs exist. Real failures are logged server-side.
    try {
      let body: { email?: string; orderNumber?: string } = {}
      try {
        body = (await (req as unknown as Request).json()) as typeof body
      } catch {
        return Response.json({ ok: true })
      }
      const email = body.email?.trim().toLowerCase()
      const orderNumber = body.orderNumber?.trim()
      if (!email || !orderNumber) return Response.json({ ok: true })

      const result = await req.payload.find({
        collection: 'orders',
        where: {
          orderNumber: { equals: orderNumber },
          customerEmail: { equals: email },
        },
        limit: 1,
      })
      const order = result.docs[0] as Order | undefined
      if (!order) return Response.json({ ok: true })

      const ttlSeconds = 60 * 60 * 24
      const magicToken = signMagicLink(order.id, ttlSeconds)
      const lookupUrl = `${getSiteUrl()}/orders/lookup?token=${encodeURIComponent(magicToken)}`

      await sendTemplated({
        payload: req.payload,
        key: 'order.magic-link',
        to: email,
        orderId: order.id,
        vars: {
          customerName: order.customerName ?? '',
          orderNumber: order.orderNumber ?? '',
          lookupUrl,
          expiresIn: describeTtl(ttlSeconds),
        },
      })

      return Response.json({ ok: true })
    } catch (err) {
      logger.error({ err }, 'orders.request-magic-link failed')
      Sentry.captureException(err, { tags: { endpoint: 'orders-request-magic-link' } })
      return Response.json({ ok: true })
    }
  },
}

export const orderByMagicLink: Endpoint = {
  path: '/orders/by-magic-link',
  method: 'get',
  handler: async (req) => {
    try {
      const url = new URL(req.url || 'http://localhost')
      const token = url.searchParams.get('token')
      if (!token) throw new HttpError(400, 'token is required.')

      const payload = verifyMagicLink(token)
      if (!payload) throw new HttpError(401, 'Invalid or expired link.')

      const order = (await req.payload.findByID({
        collection: 'orders',
        id: payload.orderId,
      })) as Order

      return Response.json({ order: publicOrder(order) })
    } catch (err) {
      if (!(err instanceof HttpError)) {
        logger.error({ err }, 'orders.by-magic-link failed')
        Sentry.captureException(err, { tags: { endpoint: 'orders-by-magic-link' } })
      }
      return errorResponse(err)
    }
  },
}

export const ordersByCustomer: Endpoint = {
  path: '/orders/by-customer',
  method: 'get',
  handler: async (req) => {
    try {
      const customerToken = getCustomerTokenFromRequest(req.headers)
      if (!customerToken) return Response.json({ orders: [] })

      const result = await req.payload.find({
        collection: 'orders',
        where: { customerToken: { equals: customerToken } },
        sort: '-createdAt',
        limit: 50,
      })

      return Response.json({
        orders: result.docs.map((doc) => {
          const view = publicOrder(doc as Order)
          // Each row also carries its own lookupUrl so the storefront can
          // link straight into the per-order detail view.
          return {
            orderNumber: view.orderNumber,
            status: view.status,
            displayCurrency: view.displayCurrency,
            total: view.total,
            createdAt: view.createdAt,
            lookupUrl: buildOrderLookupUrl(doc as Order),
          }
        }),
      })
    } catch (err) {
      if (!(err instanceof HttpError)) {
        logger.error({ err }, 'orders.by-customer failed')
        Sentry.captureException(err, { tags: { endpoint: 'orders-by-customer' } })
      }
      return errorResponse(err)
    }
  },
}

export const orderEndpoints: Endpoint[] = [
  orderByToken,
  orderRequestMagicLink,
  orderByMagicLink,
  ordersByCustomer,
]
