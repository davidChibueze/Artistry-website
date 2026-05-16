import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config'

interface TemplateSeed {
  key: string
  subject: string
  paragraphs: string[]
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
  }
}

function bodyDoc(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map(paragraph),
    },
  }
}

const SEEDS: TemplateSeed[] = [
  {
    key: 'order.paid',
    subject: 'Thanks {{customerName}} — your Poshbugati order is confirmed',
    paragraphs: [
      'Hi {{customerName}},',
      "We've received your payment for order {{orderNumber}}. Total: {{orderTotal}} {{currency}}.",
      'You ordered:',
      '{{itemsList}}',
      'You can track your order any time at {{lookupUrl}}.',
      'If your order includes digital goods, download them here: {{downloadUrl}}.',
      '— Poshbugati',
    ],
  },
  {
    key: 'order.fulfilled',
    subject: 'Your Poshbugati order {{orderNumber}} is ready',
    paragraphs: [
      'Hi {{customerName}},',
      'Order {{orderNumber}} is fulfilled. Items: {{itemsList}}.',
      'Digital downloads (if any): {{downloadUrl}}.',
      'Order status: {{lookupUrl}}.',
      '— Poshbugati',
    ],
  },
  {
    key: 'order.shipped',
    subject: 'Your Poshbugati order {{orderNumber}} has shipped',
    paragraphs: [
      'Hi {{customerName}},',
      'Order {{orderNumber}} shipped via {{trackingCarrier}}.',
      'Tracking number: {{trackingNumber}}',
      'Track it: {{trackingUrl}}',
      'Order status: {{lookupUrl}}',
      '— Poshbugati',
    ],
  },
  {
    key: 'order.refunded',
    subject: 'Refund issued for Poshbugati order {{orderNumber}}',
    paragraphs: [
      'Hi {{customerName}},',
      'A refund of {{refundAmount}} {{currency}} has been issued for order {{orderNumber}}.',
      'It may take a few business days for the funds to appear on your statement.',
      'Order details: {{lookupUrl}}',
      '— Poshbugati',
    ],
  },
  {
    key: 'order.cancelled',
    subject: 'Poshbugati order {{orderNumber}} cancelled',
    paragraphs: [
      'Hi {{customerName}},',
      'Order {{orderNumber}} has been cancelled. If this was unexpected, reply to this email and we will help sort it out.',
      'Order details: {{lookupUrl}}',
      '— Poshbugati',
    ],
  },
  {
    key: 'order.magic-link',
    subject: 'Your Poshbugati order link',
    paragraphs: [
      'Hi {{customerName}},',
      'You can view order {{orderNumber}} here: {{lookupUrl}}',
      'This link is valid for {{expiresIn}}.',
      "If you didn't request this, you can safely ignore the email.",
      '— Poshbugati',
    ],
  },
  {
    key: 'cart.abandoned',
    subject: 'You left something in your cart at Poshbugati',
    paragraphs: [
      'Hi {{customerName}},',
      'Your cart is still waiting:',
      '{{itemsList}}',
      'Pick up where you left off: {{cartUrl}}',
      '— Poshbugati',
    ],
  },
  {
    key: 'welcome.newsletter',
    subject: 'Welcome to Poshbugati, {{firstName}}!',
    paragraphs: [
      'Hi {{firstName}},',
      "You've been subscribed to {{subscriptionType}}.",
      'Stay tuned for exclusive updates, new music, tour dates, and more from Poshbugati.',
      'Visit the website: https://poshbugati.com',
      '— Poshbugati',
    ],
  },
  {
    key: 'contact.auto-reply',
    subject: 'We received your message, {{name}}',
    paragraphs: [
      'Hi {{name}},',
      "Thanks for reaching out about \"{{subject}}\". We'll get back to you as soon as possible.",
      '— Poshbugati',
    ],
  },
]

export async function seedEmailTemplates(payloadInstance?: Payload) {
  const payload = payloadInstance ?? (await getPayload({ config }))

  console.log(`Seeding ${SEEDS.length} email templates (idempotent)...`)

  let created = 0
  let skipped = 0

  for (const tpl of SEEDS) {
    const existing = await payload.find({
      collection: 'email-templates',
      where: { key: { equals: tpl.key } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      skipped++
      console.log(`  skip   ${tpl.key} (already exists)`)
      continue
    }

    await payload.create({
      collection: 'email-templates',
      data: {
        key: tpl.key,
        subject: tpl.subject,
        body: bodyDoc(tpl.paragraphs) as unknown as Parameters<
          typeof payload.create<'email-templates'>
        >[0]['data']['body'],
        enabled: true,
      },
    })
    created++
    console.log(`  create ${tpl.key}`)
  }

  console.log(`Done. created=${created} skipped=${skipped}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedEmailTemplates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Email template seed failed:', err)
      process.exit(1)
    })
}
