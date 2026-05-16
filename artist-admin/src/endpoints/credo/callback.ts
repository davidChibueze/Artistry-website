import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { verifyTransaction, fromLowestUnit } from '../../utilities/credo'
import { logger } from '../../lib/logger'
import { getSiteUrl } from '../../utilities/orderEmailVars'
import { afterOrderPaid } from '../checkout/postPayment'
import type { Order } from '../../payload-types'

function redirectTo(url: string): Response {
  return new Response(null, { status: 303, headers: { Location: url } })
}

export const credoCallback: Endpoint = {
  path: '/credo/callback',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url || '')
    const transRef = url.searchParams.get('transRef')
    const siteUrl = getSiteUrl()

    if (!transRef) {
      return redirectTo(`${siteUrl}/checkout?failed=1`)
    }

    try {
      const verification = await verifyTransaction(transRef)

      if (verification.data.status !== 0) {
        return redirectTo(`${siteUrl}/checkout?failed=1`)
      }

      const payload = await req.payload
      const orderNumber = verification.data.businessRef

      const existingOrder = await payload.find({
        collection: 'orders',
        where: {
          orderNumber: { equals: orderNumber },
        },
      })

      if (existingOrder.docs.length === 0) {
        return redirectTo(`${siteUrl}/checkout?failed=1`)
      }

      const order = existingOrder.docs[0] as Order

      if (order.status !== 'Paid' && order.status !== 'Fulfilled') {
        const updated = (await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'Paid',
            credoReference: verification.data.transRef,
            paymentProvider: 'credo',
            paidCurrency: 'NGN',
            paidAmount: fromLowestUnit(verification.data.transAmount),
            total: fromLowestUnit(verification.data.transAmount),
          },
        })) as Order
        await afterOrderPaid(payload, updated)
      }

      const token = order.lookupToken ? `?t=${encodeURIComponent(order.lookupToken)}` : ''
      return redirectTo(`${siteUrl}/orders/${encodeURIComponent(orderNumber)}${token}`)
    } catch (error) {
      logger.error({ err: error, transRef }, 'Credo callback error')
      Sentry.captureException(error, { tags: { endpoint: 'credo-callback' } })
      return redirectTo(`${siteUrl}/checkout?failed=1`)
    }
  },
}
