import type { Payload } from 'payload'
import type { SerializedEditorState } from 'lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import type { EmailTemplate } from '../payload-types'

export type TemplateVars = Record<string, string | number | null | undefined>

export interface RenderedTemplate {
  subject: string
  html: string
  text: string
  fromName?: string | null
  fromEmail?: string | null
  replyTo?: string | null
  template: EmailTemplate
}

export class TemplateMissingError extends Error {
  constructor(public key: string) {
    super(`Email template not found for key: ${key}`)
  }
}

export class TemplateDisabledError extends Error {
  constructor(public key: string) {
    super(`Email template is disabled for key: ${key}`)
  }
}

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch] ?? ch)
}

function substituteVars(input: string, vars: TemplateVars, mode: 'html' | 'text'): string {
  return input.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, name: string) => {
    if (!(name in vars)) return ''
    const value = vars[name]
    if (value == null) return ''
    const stringified = String(value)
    if (mode === 'text') return stringified
    // In HTML mode: variables ending in "Html" are inserted raw to allow rendered fragments
    // (e.g. itemsListHtml). All others are HTML-escaped.
    return name.endsWith('Html') ? stringified : escapeHtml(stringified)
  })
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const SHELL_OPEN = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.55;">`
const SHELL_CLOSE = `<p style="color: #888; font-size: 12px; margin-top: 48px; border-top: 1px solid #eee; padding-top: 16px;">You're receiving this from <a href="https://poshbugati.com" style="color: #888;">poshbugati.com</a>.</p></div>`

function wrapEmailShell(bodyHtml: string): string {
  return `${SHELL_OPEN}${bodyHtml}${SHELL_CLOSE}`
}

export async function findTemplate(payload: Payload, key: string): Promise<EmailTemplate | null> {
  const result = await payload.find({
    collection: 'email-templates',
    where: { key: { equals: key } },
    limit: 1,
  })
  return (result.docs[0] as EmailTemplate | undefined) ?? null
}

export async function renderTemplate(
  payload: Payload,
  key: string,
  vars: TemplateVars,
): Promise<RenderedTemplate> {
  const template = await findTemplate(payload, key)
  if (!template) throw new TemplateMissingError(key)
  if (template.enabled === false) throw new TemplateDisabledError(key)

  const subject = substituteVars(template.subject ?? '', vars, 'text')

  const lexicalData = template.body as unknown as SerializedEditorState
  const bodyHtml = convertLexicalToHTML({
    data: lexicalData,
    disableContainer: true,
  })

  const substitutedHtml = substituteVars(bodyHtml, vars, 'html')
  const html = wrapEmailShell(substitutedHtml)
  const text = htmlToPlainText(substitutedHtml)

  return {
    subject,
    html,
    text,
    fromName: template.fromName,
    fromEmail: template.fromEmail,
    replyTo: template.replyTo,
    template,
  }
}
