import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const TourShows: CollectionConfig = {
  slug: 'tour-shows',
  admin: {
    useAsTitle: 'venue',
    defaultColumns: ['venue', 'city', 'date', 'type', 'soldOut'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'venue',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'time',
      type: 'text',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Headline', value: 'Headline' },
        { label: 'Festival', value: 'Festival' },
        { label: 'Support', value: 'Support' },
        { label: 'Private', value: 'Private' },
      ],
    },
    {
      name: 'soldOut',
      type: 'checkbox',
    },
    {
      name: 'ticketUrl',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'text',
    },
  ],
}
