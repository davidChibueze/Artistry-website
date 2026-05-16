import type { Payload } from 'payload'
import * as Sentry from '@sentry/nextjs'

import { logger } from '../lib/logger'
import { sendEmail, type SendEmailArgs } from './email'
import {
  renderTemplate,
  TemplateDisabledError,
  TemplateMissingError,
  type TemplateVars,
} from './templateRender'

export interface SendTemplatedArgs {
  payload: Payload
  key: string
  to: string | string[]
  vars: TemplateVars
  orderId?: number | null
  /**
   * If true and an EmailLog with status='sent' already exists for this (orderId, key) pair,
   * skip the send and return the existing log id. Used for order status transition hooks
   * that may re-run on document re-saves.
   */
  dedupePerOrder?: boolean
}

export interface SendTemplatedResult {
  status: 'sent' | 'failed' | 'skipped-disabled' | 'skipped-missing' | 'skipped-duplicate'
  resendId?: string
  logId?: number
  error?: string
}

export async function sendTemplated(args: SendTemplatedArgs): Promise<SendTemplatedResult> {
  const { payload, key, to, vars, orderId, dedupePerOrder } = args
  const recipient = Array.isArray(to) ? to[0] : to

  if (dedupePerOrder && orderId) {
    const existing = await payload.find({
      collection: 'email-logs',
      where: {
        templateKey: { equals: key },
        order: { equals: orderId },
        status: { equals: 'sent' },
      },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      return { status: 'skipped-duplicate', logId: doc.id, resendId: (doc as { resendId?: string }).resendId }
    }
  }

  let rendered
  try {
    rendered = await renderTemplate(payload, key, vars)
  } catch (err) {
    if (err instanceof TemplateMissingError) {
      logger.warn({ key }, 'Email template missing — skipping send')
      return { status: 'skipped-missing' }
    }
    if (err instanceof TemplateDisabledError) {
      logger.info({ key }, 'Email template disabled — skipping send')
      return { status: 'skipped-disabled' }
    }
    throw err
  }

  const sendArgs: SendEmailArgs = {
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  }
  if (rendered.fromEmail) {
    sendArgs.from = rendered.fromName
      ? `${rendered.fromName} <${rendered.fromEmail}>`
      : rendered.fromEmail
  }
  if (rendered.replyTo) sendArgs.replyTo = rendered.replyTo

  try {
    const result = await sendEmail(sendArgs)
    const resendId = (result as { data?: { id?: string } }).data?.id

    const log = await payload.create({
      collection: 'email-logs',
      data: {
        templateKey: key,
        to: recipient,
        subject: rendered.subject,
        status: 'sent',
        resendId: resendId ?? null,
        order: orderId ?? null,
        sentAt: new Date().toISOString(),
      },
    })

    if (orderId) {
      // Append to Orders.emailsSent for visibility on the order detail view.
      const order = await payload.findByID({ collection: 'orders', id: orderId })
      const emailsSent = [
        ...(((order as { emailsSent?: { templateKey?: string; sentAt?: string }[] }).emailsSent) ?? []),
        { templateKey: key, sentAt: new Date().toISOString() },
      ]
      await payload.update({
        collection: 'orders',
        id: orderId,
        data: { emailsSent },
        context: { skipHooks: true },
      })
    }

    return { status: 'sent', resendId, logId: log.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error({ err, key, to: recipient }, 'Templated email send failed')
    Sentry.captureException(err, { tags: { utility: 'sendTemplated', templateKey: key } })

    const log = await payload.create({
      collection: 'email-logs',
      data: {
        templateKey: key,
        to: recipient,
        subject: rendered.subject,
        status: 'failed',
        order: orderId ?? null,
        error: message,
        sentAt: new Date().toISOString(),
      },
    })

    return { status: 'failed', error: message, logId: log.id }
  }
}
