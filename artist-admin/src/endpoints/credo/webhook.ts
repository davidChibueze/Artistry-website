import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { verifyTransaction, fromLowestUnit } from '../../utilities/credo'
import { logger } from '../../lib/logger'
import { afterOrderPaid } from '../checkout/postPayment'
import type { Order } from '../../payload-types'

export const credoWebhook: Endpoint = {
  path: '/credo/webhook',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await req.json?.()
      if (!body) {
        return Response.json({ error: 'Missing body' }, { status: 400 })
      }
      const { data } = body

      if (!data?.transRef) {
        return Response.json({ error: 'Missing transRef' }, { status: 400 })
      }

      const verification = await verifyTransaction(data.transRef)

      if (verification.data.status !== 0) {
        return Response.json({ message: 'Payment not successful' }, { status: 200 })
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

      if (order.status === 'Paid' || order.status === 'Fulfilled') {
        return Response.json({ message: 'Already processed' }, { status: 200 })
      }

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

      return Response.json({ message: 'Order updated' }, { status: 200 })
    } catch (error) {
      logger.error({ err: error }, 'Credo webhook error')
      Sentry.captureException(error, { tags: { endpoint: 'credo-webhook' } })
      return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
  },
}
