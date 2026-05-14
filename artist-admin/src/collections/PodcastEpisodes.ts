import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['episodeNumber', 'title', 'publishDate', 'featured'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'episodeNumber',
      type: 'number',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'publishDate',
      type: 'date',
    },
    {
      name: 'duration',
      type: 'text',
    },
    {
      name: 'audioUrl',
      type: 'text',
    },
    {
      name: 'guestName',
      type: 'text',
    },
    {
      name: 'guestBio',
      type: 'text',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
    },
  ],
}
