import type { CollectionConfig } from 'payload'

import { generateSlug } from '../hooks/generateSlug'
import { isAdminOrEditor, publicRead } from '../access/roles'

export const Releases: CollectionConfig = {
  slug: 'releases',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'releaseDate', 'featured'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      index: true,
      hooks: {
        beforeChange: [generateSlug('title')],
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'EP', value: 'EP' },
        { label: 'Album', value: 'Album' },
        { label: 'Single', value: 'Single' },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'releaseDate',
      type: 'date',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'featured',
      type: 'checkbox',
    },
    {
      name: 'tracks',
      type: 'array',
      fields: [
        {
          name: 'number',
          type: 'number',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'subtitle',
          type: 'text',
        },
        {
          name: 'duration',
          type: 'text',
        },
        {
          name: 'badge',
          type: 'text',
        },
        {
          name: 'previewUrl',
          type: 'text',
        },
        {
          name: 'audioFile',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'streamingLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Spotify', value: 'Spotify' },
            { label: 'Apple Music', value: 'Apple Music' },
            { label: 'YouTube Music', value: 'YouTube Music' },
            { label: 'Amazon Music', value: 'Amazon Music' },
            { label: 'Tidal', value: 'Tidal' },
            { label: 'Deezer', value: 'Deezer' },
            { label: 'SoundCloud', value: 'SoundCloud' },
          ],
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'distributionTiers',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
          ],
        },
      ],
    },
  ],
}
