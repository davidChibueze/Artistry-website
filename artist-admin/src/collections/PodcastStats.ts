import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const PodcastStats: CollectionConfig = {
  slug: 'podcast-stats',
  admin: {
    useAsTitle: 'totalEpisodes',
    defaultColumns: ['totalEpisodes', 'totalListeners', 'averageRating'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'totalEpisodes',
      type: 'number',
    },
    {
      name: 'totalListeners',
      type: 'number',
    },
    {
      name: 'averageRating',
      type: 'number',
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}
