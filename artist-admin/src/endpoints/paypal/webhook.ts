import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../../lib/logger'
import { verifyWebhookSignature } from '../../utilities/paypal'
import { buildOrderVars } from '../../utilities/orderEmailVars'
import { sendTemplated } from '../../utilities/sendTemplated'
import { afterOrderPaid } from '../checkout/postPayment'
import type { Order } from '../../payload-types'

interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource_type?: string
  resource?: {
    id?: string
    status?: string
    amount?: { value?: string; currency_code?: string }
    invoice_id?: string
    custom_id?: string
    supplementary_data?: {
      related_ids?: { order_id?: string }
    }
  }
}

async function findOrderForCapture(
  payload: Parameters<Endpoint['handler']>[0]['payload'],
  event: PayPalWebhookEvent,
): Promise<Order | null> {
  const resource = event.resource
  if (!resource) return null

  // PayPal capture events expose the parent order id via supplementary_data.
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id
  if (paypalOrderId) {
    const byOrderId = await payload.find({
      collection: 'orders',
      where: { paypalOrderId: { equals: paypalOrderId } },
      limit: 1,
    })
    if (byOrderId.docs[0]) return byOrderId.docs[0] as Order
  }

  // Fallback: invoice_id is the orderNumber we set when creating the order.
  if (resource.invoice_id) {
    const byInvoice = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: resource.invoice_id } },
      limit: 1,
    })
    if (byInvoice.docs[0]) return byInvoice.docs[0] as Order
  }

  if (resource.id) {
    const byCaptureId = await payload.find({
      collection: 'orders',
      where: { paypalCaptureId: { equals: resource.id } },
      limit: 1,
    })
    if (byCaptureId.docs[0]) return byCaptureId.docs[0] as Order
  }

  return null
}

export const paypalWebhook: Endpoint = {
  path: '/paypal/webhook',
  method: 'post',
  handler: async (req) => {
    try {
      const body = (await (req as unknown as Request).json()) as PayPalWebhookEvent
      if (!body || !body.event_type) {
        return Response.json({ error: 'Invalid body' }, { status: 400 })
      }

      const verified = await verifyWebhookSignature({ headers: req.headers, body })
      if (!verified) {
        logger.warn({ eventId: body.id, eventType: body.event_type }, 'PayPal webhook signature failed')
        return Response.json({ error: 'Invalid signature' }, { status: 401 })
      }

      const order = await findOrderForCapture(req.payload, body)
      if (!order) {
        logger.warn({ eventType: body.event_type, resource: body.resource }, 'PayPal webhook order not found')
        return Response.json({ message: 'Order not found' }, { status: 200 })
      }

      switch (body.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED': {
          if (order.status === 'Paid' || order.status === 'Fulfilled') {
            return Response.json({ message: 'Already processed' }, { status: 200 })
          }
          const captureId = body.resource?.id
          const paidAmount = Number(body.resource?.amount?.value ?? order.total ?? 0)
          const updated = (await req.payload.update({
            collection: 'orders',
            id: order.id,
            data: {
              status: 'Paid',
              paypalCaptureId: captureId ?? order.paypalCaptureId,
              paidCurrency: 'USD',
              paidAmount,
            },
          })) as Order
          await afterOrderPaid(req.payload, updated)
          return Response.json({ message: 'Order paid' }, { status: 200 })
        }

        case 'PAYMENT.CAPTURE.REFUNDED':
        case 'PAYMENT.CAPTURE.REVERSED': {
          if (order.status === 'Refunded') {
            return Response.json({ message: 'Already refunded' }, { status: 200 })
          }
          const refundAmount = Number(body.resource?.amount?.value ?? order.total ?? 0)
          await req.payload.update({
            collection: 'orders',
            id: order.id,
            data: { status: 'Refunded' },
          })
          if (order.customerEmail) {
            await sendTemplated({
              payload: req.payload,
              key: 'order.refunded',
              to: order.customerEmail,
              orderId: order.id,
              dedupePerOrder: true,
              vars: {
                ...buildOrderVars(order),
                refundAmount: refundAmount.toFixed(2),
              },
            })
          }
          return Response.json({ message: 'Refund recorded' }, { status: 200 })
        }

        default:
          logger.info({ eventType: body.event_type }, 'PayPal webhook ignored')
          return Response.json({ message: 'Ignored' }, { status: 200 })
      }
    } catch (err) {
      logger.error({ err }, 'PayPal webhook error')
      Sentry.captureException(err, { tags: { endpoint: 'paypal-webhook' } })
      return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
  },
}
