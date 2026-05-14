import type { Endpoint } from 'payload'
import { verifyTransaction, fromLowestUnit } from '../../utilities/credo'

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

      if (order.status !== 'Complete') {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'Complete',
            credoReference: verification.data.transRef,
            total: fromLowestUnit(verification.data.transAmount),
          },
        })
      }

      return Response.json({
        message: 'Payment successful',
        status: 'success',
        orderNumber,
        downloadToken: (order as any).downloadToken,
      })
    } catch (error) {
      console.error('Credo callback error:', error)
      return Response.json({ error: 'Verification failed' }, { status: 500 })
    }
  },
}
