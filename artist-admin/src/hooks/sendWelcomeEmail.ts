import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../lib/logger'
import { sendTemplated } from '../utilities/sendTemplated'

export const sendWelcomeEmail: CollectionAfterChangeHook = async ({ doc, operation, context, req }) => {
  if (operation !== 'create' || context.skipWelcomeEmail) return doc

  const email = (doc as { email?: string }).email
  if (!email) return doc

  const firstName = (doc as { firstName?: string }).firstName || 'fan'
  const subscriptionType = (doc as { type?: string }).type || 'Newsletter'

  try {
    await sendTemplated({
      payload: req.payload,
      key: 'welcome.newsletter',
      to: email,
      vars: { firstName, subscriptionType },
    })
  } catch (error) {
    logger.error({ err: error, email }, 'Failed to send welcome email')
    Sentry.captureException(error, { tags: { hook: 'send-welcome-email' } })
  }

  return doc
}
