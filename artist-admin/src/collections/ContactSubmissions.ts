import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, isAdminOrEditorOrViewer, publicCreateOnly } from '../access/roles'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'inquiryType', 'status', 'submittedAt'],
  },
  access: {
    create: publicCreateOnly.create,
    read: isAdminOrEditorOrViewer,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'organization',
      type: 'text',
    },
    {
      name: 'inquiryType',
      type: 'select',
      options: [
        { label: 'Booking', value: 'Booking' },
        { label: 'Press', value: 'Press' },
        { label: 'Collaboration', value: 'Collaboration' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'eventDate',
      type: 'date',
    },
    {
      name: 'budget',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'New',
      options: [
        { label: 'New', value: 'New' },
        { label: 'Read', value: 'Read' },
        { label: 'Replied', value: 'Replied' },
        { label: 'Archived', value: 'Archived' },
      ],
    },
  ],
}
