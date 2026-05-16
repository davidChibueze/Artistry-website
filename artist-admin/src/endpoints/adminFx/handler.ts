import type { Endpoint } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../../lib/logger'
import { getUsdToNgnRate } from '../../utilities/fxHint'

function isStaff(user: { role?: string | null } | undefined | null): boolean {
  return Boolean(user && (user.role === 'admin' || user.role === 'editor'))
}

export const adminFxUsdToNgn: Endpoint = {
  path: '/admin-fx/usd-to-ngn',
  method: 'get',
  handler: async (req) => {
    if (!isStaff(req.user as { role?: string } | null)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const url = new URL(req.url || 'http://localhost')
      const force = url.searchParams.get('force') === '1'
      const result = await getUsdToNgnRate(force)
      return Response.json({
        rate: result.rate,
        fetchedAt: new Date(result.fetchedAt).toISOString(),
      })
    } catch (err) {
      logger.error({ err }, 'admin-fx/usd-to-ngn failed')
      Sentry.captureException(err, { tags: { endpoint: 'admin-fx-usd-to-ngn' } })
      return Response.json({ error: 'FX lookup failed' }, { status: 502 })
    }
  },
}
