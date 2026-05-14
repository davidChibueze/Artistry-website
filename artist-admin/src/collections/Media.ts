import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Release Cover', value: 'Release Cover' },
        { label: 'Press Photo', value: 'Press Photo' },
        { label: 'Merch', value: 'Merch' },
        { label: 'Blog', value: 'Blog' },
        { label: 'Artist', value: 'Artist' },
        { label: 'Other', value: 'Other' },
      ],
    },
  ],
  upload: {
    staticDir: 'media',
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
      'application/zip',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
      },
      {
        name: 'medium',
        width: 800,
      },
      {
        name: 'large',
        width: 1600,
      },
    ],
  },
}
