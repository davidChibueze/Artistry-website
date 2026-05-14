import type { CollectionBeforeChangeHook } from 'payload'

export const generateOrderNumber: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation === 'create' && !data?.orderNumber) {
    const year = new Date().getFullYear()
    const existingOrders = await req.payload.find({
      collection: 'orders',
      limit: 1,
      sort: '-createdAt',
      select: {
        orderNumber: true,
      },
    })

    let nextNumber = 1
    if (existingOrders.docs.length > 0) {
      const lastOrder = existingOrders.docs[0]
      const match = (lastOrder as any).orderNumber?.match(/PB-(\d{4})-(\d{4})/)
      if (match && parseInt(match[1]) === year) {
        nextNumber = parseInt(match[2]) + 1
      }
    }

    data.orderNumber = `PB-${year}-${String(nextNumber).padStart(4, '0')}`
  }
  return data
}
