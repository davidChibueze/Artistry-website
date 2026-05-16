import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../../lib/logger'
import { initializePayment, toLowestUnit } from '../../utilities/credo'
import { getSiteUrl } from '../../utilities/orderEmailVars'
import { findCartByCookieId, HttpError, errorResponse } from '../cart/lib'
import { getCartIdFromRequest } from '../../utilities/cartCookie'
import {
  createPendingOrder,
  revalidateCartLines,
  validateCustomer,
} from './lib'

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

export const credoCheckout: Endpoint = {
  path: '/checkout/credo',
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
        displayCurrency: 'NGN',
        paymentProvider: 'credo',
        req,
      })

      const callbackUrl = `${getSiteUrl()}/api/credo/callback`
      const { first, last } = splitName(customer.customerName)

      const credoResp = await initializePayment({
        amount: toLowestUnit(order.total ?? 0, 'NGN'),
        email: customer.email,
        currency: 'NGN',
        reference: order.orderNumber ?? `order-${order.id}`,
        callbackUrl,
        customerFirstName: first || undefined,
        customerLastName: last || undefined,
        customerPhoneNumber: customer.phone,
        narration: `Order ${order.orderNumber}`,
      })

      const authorizationUrl = credoResp.data?.authorizationUrl
      const credoReference = credoResp.data?.credoReference ?? credoResp.data?.reference

      if (!authorizationUrl) {
        throw new HttpError(502, 'Credo did not return an authorization URL.')
      }

      await req.payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          credoAuthorizationUrl: authorizationUrl,
          credoReference: credoReference ?? null,
        },
      })

      return Response.json({
        orderNumber: order.orderNumber,
        authorizationUrl,
        lookupToken: order.lookupToken,
      })
    } catch (err) {
      if (!(err instanceof HttpError)) {
        logger.error({ err }, 'Credo checkout failed')
        Sentry.captureException(err, { tags: { endpoint: 'credo-checkout' } })
      }
      return errorResponse(err)
    }
  },
}
