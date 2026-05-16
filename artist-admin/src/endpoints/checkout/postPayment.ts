import type { Payload } from 'payload'

import type { Order } from '../../payload-types'
import { logger } from '../../lib/logger'
import { buildOrderVars } from '../../utilities/orderEmailVars'
import { sendTemplated } from '../../utilities/sendTemplated'

/**
 * Fire the order.paid email and clear the cart that produced this order.
 * Idempotent — uses sendTemplated's dedupePerOrder against EmailLogs.
 */
export async function afterOrderPaid(payload: Payload, order: Order): Promise<void> {
  if (!order.customerEmail) return

  await sendTemplated({
    payload,
    key: 'order.paid',
    to: order.customerEmail,
    orderId: order.id,
    dedupePerOrder: true,
    vars: buildOrderVars(order),
  })

  if (order.customerToken) {
    try {
      const matchingCarts = await payload.find({
        collection: 'carts',
        where: { customerToken: { equals: order.customerToken } },
        limit: 5,
      })
      for (const cart of matchingCarts.docs) {
        if ((cart.items ?? []).length === 0) continue
        await payload.update({
          collection: 'carts',
          id: cart.id,
          data: { items: [] },
        })
      }
    } catch (err) {
      logger.warn({ err, orderNumber: order.orderNumber }, 'Failed to clear cart after payment')
    }
  }
}
