import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../../lib/logger'
import { buildOrderVars } from '../../utilities/orderEmailVars'
import { sendTemplated } from '../../utilities/sendTemplated'
import type { Order, User } from '../../payload-types'

function isStaff(user: User | null | undefined): boolean {
  return Boolean(user && (user.role === 'admin' || user.role === 'editor'))
}

async function readJson<T>(req: Request): Promise<T> {
  return (await req.json()) as T
}

const SAMPLE_VARS: Record<string, Record<string, string>> = {
  'order.paid': {
    customerName: 'Sample Buyer',
    orderNumber: 'PB-2026-9999',
    orderTotal: '$25.00',
    currency: 'USD',
    itemsList: '• Sample Tee (Size: M) × 1 — $25.00',
    itemsListHtml: '<ul><li>Sample Tee <em>Size: M</em> × 1 — $25.00</li></ul>',
    lookupUrl: 'https://poshbugati.com/orders/PB-2026-9999?t=sample',
    downloadUrl: 'https://poshbugati.com/orders/PB-2026-9999/download?t=sample',
  },
  'order.fulfilled': {
    customerName: 'Sample Buyer',
    orderNumber: 'PB-2026-9999',
    itemsList: '• Sample Tee × 1',
    itemsListHtml: '<ul><li>Sample Tee × 1</li></ul>',
    lookupUrl: 'https://poshbugati.com/orders/PB-2026-9999?t=sample',
    downloadUrl: '',
  },
  'order.shipped': {
    customerName: 'Sample Buyer',
    orderNumber: 'PB-2026-9999',
    trackingCarrier: 'DHL',
    trackingNumber: '123456789',
    trackingUrl: 'https://www.dhl.com/track?awb=123456789',
    lookupUrl: 'https://poshbugati.com/orders/PB-2026-9999?t=sample',
  },
  'order.refunded': {
    customerName: 'Sample Buyer',
    orderNumber: 'PB-2026-9999',
    refundAmount: '25.00',
    currency: 'USD',
    lookupUrl: 'https://poshbugati.com/orders/PB-2026-9999?t=sample',
  },
  'order.cancelled': {
    customerName: 'Sample Buyer',
    orderNumber: 'PB-2026-9999',
    lookupUrl: 'https://poshbugati.com/orders/PB-2026-9999?t=sample',
  },
  'order.magic-link': {
    customerName: 'Sample Buyer',
    orderNumber: 'PB-2026-9999',
    lookupUrl: 'https://poshbugati.com/orders/lookup?token=sample',
    expiresIn: '24 hours',
  },
  'cart.abandoned': {
    customerName: 'Sample Buyer',
    itemsList: '• Sample Tee × 1',
    itemsListHtml: '<ul><li>Sample Tee × 1</li></ul>',
    cartUrl: 'https://poshbugati.com/cart',
    currency: 'USD',
  },
  'welcome.newsletter': {
    firstName: 'Sample',
    subscriptionType: 'Newsletter',
  },
  'contact.auto-reply': {
    name: 'Sample Sender',
    subject: 'A question about your work',
  },
}

export const adminEmailTest: Endpoint = {
  path: '/admin-email/test',
  method: 'post',
  handler: async (req) => {
    const user = req.user as User | null
    if (!isStaff(user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const body = await readJson<{ templateKey?: string; to?: string; vars?: Record<string, string> }>(
        req as unknown as Request,
      )
      const templateKey = body.templateKey?.trim()
      if (!templateKey) return Response.json({ error: 'templateKey is required' }, { status: 400 })

      const to = body.to?.trim() || (user as User).email
      if (!to) return Response.json({ error: 'to address required' }, { status: 400 })

      const vars = { ...(SAMPLE_VARS[templateKey] ?? {}), ...(body.vars ?? {}) }

      const result = await sendTemplated({
        payload: req.payload,
        key: templateKey,
        to,
        vars,
      })
      return Response.json({ result })
    } catch (err) {
      logger.error({ err }, 'admin-email/test failed')
      Sentry.captureException(err, { tags: { endpoint: 'admin-email-test' } })
      return Response.json({ error: 'Test send failed' }, { status: 500 })
    }
  },
}

export const adminEmailResendOrder: Endpoint = {
  path: '/admin-email/resend-order',
  method: 'post',
  handler: async (req) => {
    const user = req.user as User | null
    if (!isStaff(user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const body = await readJson<{ orderId?: number; templateKey?: string }>(
        req as unknown as Request,
      )
      if (!body.orderId || !body.templateKey) {
        return Response.json({ error: 'orderId and templateKey required' }, { status: 400 })
      }

      const order = (await req.payload.findByID({
        collection: 'orders',
        id: body.orderId,
      })) as Order
      if (!order.customerEmail) {
        return Response.json({ error: 'Order has no customer email' }, { status: 400 })
      }

      const result = await sendTemplated({
        payload: req.payload,
        key: body.templateKey,
        to: order.customerEmail,
        orderId: order.id,
        vars: buildOrderVars(order),
      })
      return Response.json({ result })
    } catch (err) {
      logger.error({ err }, 'admin-email/resend-order failed')
      Sentry.captureException(err, { tags: { endpoint: 'admin-email-resend-order' } })
      return Response.json({ error: 'Resend failed' }, { status: 500 })
    }
  },
}
