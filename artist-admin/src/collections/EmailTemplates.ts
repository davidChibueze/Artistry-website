import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, isAdminOrEditorOrViewer } from '../access/roles'

const TEMPLATE_KEYS: { label: string; value: string }[] = [
  { label: 'Order — payment received', value: 'order.paid' },
  { label: 'Order — fulfilled (digital ready / shipped)', value: 'order.fulfilled' },
  { label: 'Order — shipped tracking', value: 'order.shipped' },
  { label: 'Order — refunded', value: 'order.refunded' },
  { label: 'Order — cancelled', value: 'order.cancelled' },
  { label: 'Order — magic link lookup', value: 'order.magic-link' },
  { label: 'Cart — abandoned reminder', value: 'cart.abandoned' },
  { label: 'Subscription — welcome', value: 'welcome.newsletter' },
  { label: 'Contact form — auto-reply', value: 'contact.auto-reply' },
]

const VARIABLE_DOCS: Record<string, string> = {
  'order.paid':
    'Available: {{customerName}}, {{orderNumber}}, {{orderTotal}}, {{currency}}, {{itemsList}}, {{lookupUrl}}, {{downloadUrl}}',
  'order.fulfilled':
    'Available: {{customerName}}, {{orderNumber}}, {{itemsList}}, {{lookupUrl}}, {{downloadUrl}}',
  'order.shipped':
    'Available: {{customerName}}, {{orderNumber}}, {{trackingCarrier}}, {{trackingNumber}}, {{trackingUrl}}, {{lookupUrl}}',
  'order.refunded':
    'Available: {{customerName}}, {{orderNumber}}, {{refundAmount}}, {{currency}}, {{lookupUrl}}',
  'order.cancelled':
    'Available: {{customerName}}, {{orderNumber}}, {{lookupUrl}}',
  'order.magic-link':
    'Available: {{customerName}}, {{orderNumber}}, {{lookupUrl}}, {{expiresIn}}',
  'cart.abandoned':
    'Available: {{customerName}}, {{itemsList}}, {{cartUrl}}, {{currency}}',
  'welcome.newsletter':
    'Available: {{firstName}}, {{subscriptionType}}',
  'contact.auto-reply':
    'Available: {{name}}, {{subject}}',
}

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'subject', 'enabled', 'updatedAt'],
    description:
      'Subject and body content for every transactional email sent by the site. Use {{variableName}} placeholders — the substitution map for each key is documented below.',
  },
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditorOrViewer,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: TEMPLATE_KEYS,
      admin: {
        description: 'Identifies which system event triggers this template.',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to disable sends for this template without deleting it.',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Email subject line. Supports {{variables}}.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      admin: {
        description: 'Email body. Supports {{variables}} anywhere in the rich text.',
      },
    },
    {
      type: 'collapsible',
      label: 'Sender overrides (optional)',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'fromName',
              type: 'text',
              admin: { description: 'Defaults to the site sender if blank.' },
            },
            {
              name: 'fromEmail',
              type: 'email',
              admin: { description: 'Must be a verified Resend sender domain.' },
            },
          ],
        },
        {
          name: 'replyTo',
          type: 'email',
        },
      ],
    },
    {
      name: 'sendTestUi',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/SendTestEmail',
        },
      },
    },
    {
      name: 'variableDocs',
      type: 'textarea',
      admin: {
        readOnly: true,
        description:
          'Reference list of variables available for the selected key. Auto-updated when you save the template.',
      },
      hooks: {
        beforeChange: [
          ({ data }) => VARIABLE_DOCS[data?.key as string] ?? 'No variables documented for this key.',
        ],
      },
    },
  ],
  timestamps: true,
}
