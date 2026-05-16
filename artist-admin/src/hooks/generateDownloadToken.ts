import type { CollectionAfterChangeHook } from 'payload'
import crypto from 'crypto'

const UNLOCK_STATUSES = new Set(['Paid', 'Fulfilled'])

export const generateDownloadToken: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'update' && UNLOCK_STATUSES.has(doc.status)) {
    const previousDoc = req.context.previousDoc as typeof doc | undefined
    if (!previousDoc || !UNLOCK_STATUSES.has(previousDoc.status)) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 72)

      await req.payload.update({
        collection: 'orders',
        id: doc.id,
        data: {
          downloadToken: token,
          downloadExpiresAt: expiresAt.toISOString(),
          downloadCount: 0,
        },
        req,
      })
    }
  }
  return doc
}
