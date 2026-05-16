import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { verifyTransaction, fromLowestUnit } from '../../utilities/credo'
import { logger } from '../../lib/logger'
import { afterOrderPaid } from '../checkout/postPayment'
import type { Order } from '../../payload-types'

export const credoCallback: Endpoint = {
  path: '/credo/callback',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url || '')
    const transRef = url.searchParams.get('transRef')

    if (!transRef) {
      return Response.json({ error: 'Missing transRef' }, { status: 400 })
    }

    try {
      const verification = await verifyTransaction(transRef)

      if (verification.data.status !== 0) {
        return Response.json({
          message: 'Payment failed',
          status: 'failed',
        })
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
        return Response.json({ error: 'Order not found' }, { status: 404 })
      }

      const order = existingOrder.docs[0]

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

      return Response.json({
        message: 'Payment successful',
        status: 'success',
        orderNumber,
        downloadToken: (order as any).downloadToken,
      })
    } catch (error) {
      logger.error({ err: error, transRef }, 'Credo callback error')
      Sentry.captureException(error, { tags: { endpoint: 'credo-callback' } })
      return Response.json({ error: 'Verification failed' }, { status: 500 })
    }
  },
}
