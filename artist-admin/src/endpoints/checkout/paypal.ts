import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../../lib/logger'
import { getCartIdFromRequest } from '../../utilities/cartCookie'
import { getSiteUrl } from '../../utilities/orderEmailVars'
import {
  captureOrder as paypalCapture,
  createOrder as paypalCreate,
  findCaptureFromOrderResponse,
} from '../../utilities/paypal'
import { errorResponse, findCartByCookieId, HttpError } from '../cart/lib'
import type { Order } from '../../payload-types'
import { afterOrderPaid } from './postPayment'
import {
  createPendingOrder,
  revalidateCartLines,
  validateCustomer,
} from './lib'

export const paypalCheckoutCreate: Endpoint = {
  path: '/checkout/paypal/create',
  method: 'post',
  handler: async (req) => {
    try {
      const cartId = getCartIdFromRequest(req.headers)
      if (!cartId) throw new HttpError(400, 'No cart found. Add items before checking out.')

      const cart = await findCartByCookieId(req.payload, cartId)
      if (!cart || (cart.items ?? []).length === 0) {
        throw new HttpError(400, 'Your cart is empty.')
      }

      let body: Record<string, unknown> = {}
      try {
        body = (await (req as unknown as Request).json()) as Record<string, unknown>
      } catch {
        throw new HttpError(400, 'Invalid JSON body.')
      }
      const customer = validateCustomer({
        email: body.email as string,
        customerName: body.customerName as string,
        phone: body.phone as string,
        shippingAddress: body.shippingAddress as Parameters<typeof validateCustomer>[0]['shippingAddress'],
      })

      const lines = await revalidateCartLines(req.payload, cart)

      const order = await createPendingOrder(req.payload, {
        cart,
        customer,
        lines,
        displayCurrency: 'USD',
        paymentProvider: 'paypal',
        req,
      })

      const siteUrl = getSiteUrl()
      const paypalResp = await paypalCreate({
        amountUSD: order.total ?? 0,
        orderNumber: order.orderNumber ?? `order-${order.id}`,
        customerEmail: customer.email,
        returnUrl: `${siteUrl}/orders/${encodeURIComponent(order.orderNumber ?? '')}?t=${order.lookupToken}`,
        cancelUrl: `${siteUrl}/checkout?cancelled=1`,
      })

      await req.payload.update({
        collection: 'orders',
        id: order.id,
        data: { paypalOrderId: paypalResp.id },
      })

      return Response.json({
        orderNumber: order.orderNumber,
        paypalOrderId: paypalResp.id,
        lookupToken: order.lookupToken,
      })
    } catch (err) {
      if (!(err instanceof HttpError)) {
        logger.error({ err }, 'PayPal create-order failed')
        Sentry.captureException(err, { tags: { endpoint: 'paypal-create' } })
      }
      return errorResponse(err)
    }
  },
}

export const paypalCheckoutCapture: Endpoint = {
  path: '/checkout/paypal/capture',
  method: 'post',
  handler: async (req) => {
    try {
      let body: { paypalOrderId?: string } = {}
      try {
        body = (await (req as unknown as Request).json()) as { paypalOrderId?: string }
      } catch {
        throw new HttpError(400, 'Invalid JSON body.')
      }
      if (!body.paypalOrderId) throw new HttpError(400, 'paypalOrderId is required.')

      const existing = await req.payload.find({
        collection: 'orders',
        where: { paypalOrderId: { equals: body.paypalOrderId } },
        limit: 1,
      })
      if (existing.docs.length === 0) {
        throw new HttpError(404, 'Order not found for that paypalOrderId.')
      }
      const order = existing.docs[0] as Order

      if (order.status === 'Paid' || order.status === 'Fulfilled') {
        return Response.json({
          orderNumber: order.orderNumber,
          status: order.status,
          lookupToken: order.lookupToken,
        })
      }

      const captureResp = await paypalCapture(body.paypalOrderId)
      const capture = findCaptureFromOrderResponse(captureResp)
      if (!capture || capture.status !== 'COMPLETED') {
        throw new HttpError(402, `PayPal capture not completed (status=${capture?.status ?? 'unknown'}).`)
      }

      const updated = (await req.payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'Paid',
          paypalCaptureId: capture.id,
          paidCurrency: 'USD',
          paidAmount: Number(capture.amount.value),
        },
      })) as Order

      await afterOrderPaid(req.payload, updated)

      return Response.json({
        orderNumber: updated.orderNumber,
        status: updated.status,
        lookupToken: updated.lookupToken,
      })
    } catch (err) {
      if (!(err instanceof HttpError)) {
        logger.error({ err }, 'PayPal capture failed')
        Sentry.captureException(err, { tags: { endpoint: 'paypal-capture' } })
      }
      return errorResponse(err)
    }
  },
}
