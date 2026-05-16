import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditorOrViewer } from '../access/roles'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['templateKey', 'to', 'subject', 'status', 'sentAt'],
    description: 'Record of every transactional email send. Read-only — populated by sendTemplated().',
  },
  access: {
    create: () => false,
    read: isAdminOrEditorOrViewer,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'templateKey',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'subject',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'resendId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: { readOnly: true },
    },
    {
      name: 'error',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'sentAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true },
    },
  ],
}
