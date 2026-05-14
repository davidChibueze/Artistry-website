import type { CollectionAfterChangeHook } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '../utilities/email'
import { logger } from '../lib/logger'

export const sendWelcomeEmail: CollectionAfterChangeHook = async ({ doc, operation, context }) => {
  if (operation === 'create' && !context.skipWelcomeEmail) {
    try {
      const firstName = (doc as any).firstName || 'fan'
      const type = (doc as any).type || 'Newsletter'

      await sendEmail({
        to: (doc as any).email,
        subject: 'Welcome to Poshbugati!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #c9a84c;">Welcome, ${firstName}!</h1>
            <p>You've been subscribed to <strong>${type}</strong>.</p>
            <p>Stay tuned for exclusive updates, new music, tour dates, and more from Poshbugati.</p>
            <p style="margin-top: 32px;">
              <a href="https://poshbugati.com" style="background: #c9a84c; color: #0e0b09; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Visit the Website
              </a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 48px;">
              You're receiving this because you subscribed at poshbugati.com.
            </p>
          </div>
        `,
        text: `Welcome, ${firstName}! You've been subscribed to ${type}. Stay tuned for exclusive updates from Poshbugati. Visit: https://poshbugati.com`,
      })
    } catch (error) {
      logger.error({ err: error, email: (doc as any).email }, 'Failed to send welcome email')
      Sentry.captureException(error, { tags: { hook: 'send-welcome-email' } })
    }
  }

  return doc
}
