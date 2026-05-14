import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const MediaGallery: CollectionConfig = {
  slug: 'media-gallery',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['type', 'title', 'order'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Photo', value: 'Photo' },
        { label: 'Video', value: 'Video' },
        { label: 'Press Quote', value: 'Press Quote' },
        { label: 'EPK Download', value: 'EPK Download' },
      ],
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data.type === 'Photo' || data.type === 'EPK Download',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data.type === 'Video',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'Video',
      },
    },
    {
      name: 'quote',
      type: 'richText',
      admin: {
        condition: (data) => data.type === 'Press Quote',
      },
    },
    {
      name: 'publication',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'Press Quote',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'Press Quote',
      },
    },
    {
      name: 'fileSize',
      type: 'text',
    },
    {
      name: 'fileType',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
    },
  ],
}
