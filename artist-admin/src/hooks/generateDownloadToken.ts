import type { CollectionAfterChangeHook } from 'payload'
import crypto from 'crypto'

export const generateDownloadToken: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'update' && doc.status === 'Complete') {
    const previousDoc = req.context.previousDoc as typeof doc | undefined
    if (!previousDoc || previousDoc.status !== 'Complete') {
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
