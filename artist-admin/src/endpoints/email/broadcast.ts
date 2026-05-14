import type { Endpoint, Where } from 'payload'
import { sendBroadcast } from '../../utilities/email'

export const emailBroadcast: Endpoint = {
  path: '/email/broadcast',
  method: 'post',
  handler: async (req) => {
    const user = req.user
    if (!user || (user as any).role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const body = await req.json?.()
      if (!body) {
        return Response.json({ error: 'Missing body' }, { status: 400 })
      }

      const { subject, html, text, type, batchSize, delayMs } = body

      if (!subject || !html) {
        return Response.json({ error: 'subject and html are required' }, { status: 400 })
      }

      const payload = req.payload

      const whereClause: Where = {
        and: [
          { active: { equals: true } },
        ],
      }

      if (type) {
        whereClause.and?.push({ type: { equals: type } })
      }

      const subscribers = await payload.find({
        collection: 'subscriptions',
        where: whereClause,
        limit: 10000,
        select: {
          email: true,
          firstName: true,
        },
      })

      const emails = subscribers.docs.map((s) => s.email)

      if (emails.length === 0) {
        return Response.json({ message: 'No subscribers found' }, { status: 200 })
      }

      const result = await sendBroadcast({
        to: emails,
        subject,
        html,
        text,
        batchSize: batchSize || 50,
        delayMs: delayMs || 1000,
      })

      return Response.json({
        message: 'Broadcast complete',
        ...result,
      })
    } catch (error) {
      console.error('Broadcast error:', error)
      return Response.json(
        { error: error instanceof Error ? error.message : 'Broadcast failed' },
        { status: 500 }
      )
    }
  },
}
