import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'
import { initializePayment } from '../../utilities/credo'
import { logger } from '../../lib/logger'

export const credoInitialize: Endpoint = {
  path: '/credo/initialize',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await req.json?.()
      if (!body) {
        return Response.json({ error: 'Missing request body' }, { status: 400 })
      }
      const {
        amount,
        email,
        currency,
        reference,
        callbackUrl,
        customerFirstName,
        customerLastName,
        customerPhoneNumber,
        narration,
        metadata,
      } = body

      if (!amount || !email || !currency || !reference || !callbackUrl) {
        return Response.json({ error: 'Missing required fields: amount, email, currency, reference, callbackUrl' }, { status: 400 })
      }

      const result = await initializePayment({
        amount,
        email,
        currency,
        reference,
        callbackUrl,
        customerFirstName,
        customerLastName,
        customerPhoneNumber,
        narration,
        metadata,
      })

      return Response.json(result)
    } catch (error) {
      logger.error({ err: error }, 'Credo initialize error')
      Sentry.captureException(error, { tags: { endpoint: 'credo-initialize' } })
      return Response.json({ error: 'Payment initialization failed' }, { status: 500 })
    }
  },
}
