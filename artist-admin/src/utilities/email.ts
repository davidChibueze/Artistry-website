import { Resend } from 'resend'

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  return new Resend(apiKey)
}

export interface SendEmailArgs {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'Poshbugati <hello@poshbugati.com>',
  replyTo = 'info@poshbugati.com',
}: SendEmailArgs) {
  const resend = getResend()

  return resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    replyTo,
  })
}

export interface BroadcastEmailArgs {
  to: string[]
  subject: string
  html: string
  text?: string
  batchSize?: number
  delayMs?: number
  onProgress?: (sent: number, total: number) => void
}

export async function sendBroadcast({
  to,
  subject,
  html,
  text,
  batchSize = 50,
  delayMs = 1000,
  onProgress,
}: BroadcastEmailArgs) {
  const results: { email: string; success: boolean; error?: string }[] = []
  const total = to.length

  for (let i = 0; i < total; i += batchSize) {
    const batch = to.slice(i, i + batchSize)

    const promises = batch.map(async (email) => {
      try {
        await sendEmail({ to: email, subject, html, text })
        return { email, success: true }
      } catch (error) {
        return {
          email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    const batchResults = await Promise.all(promises)
    results.push(...batchResults)

    onProgress?.(Math.min(i + batchSize, total), total)

    if (i + batchSize < total) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  const successCount = results.filter((r) => r.success).length
  const failedCount = results.filter((r) => !r.success).length

  return {
    total,
    successCount,
    failedCount,
    failures: results.filter((r) => !r.success),
  }
}
