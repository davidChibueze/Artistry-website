import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, isAdminOrEditorOrViewer, publicCreateOnly } from '../access/roles'
import { sendWelcomeEmail } from '../hooks/sendWelcomeEmail'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'type', 'subscribedAt', 'active'],
  },
  access: {
    create: publicCreateOnly.create,
    read: isAdminOrEditorOrViewer,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [sendWelcomeEmail],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Fan Club', value: 'Fan Club' },
        { label: 'Newsletter', value: 'Newsletter' },
        { label: 'Tour Notifications', value: 'Tour Notifications' },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
