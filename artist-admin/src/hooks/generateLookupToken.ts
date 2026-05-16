import type { CollectionBeforeChangeHook } from 'payload'
import crypto from 'crypto'

export const generateLookupToken: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' && !data?.lookupToken) {
    data.lookupToken = crypto.randomBytes(24).toString('hex')
  }
  return data
}
