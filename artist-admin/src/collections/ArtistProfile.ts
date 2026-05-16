import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const ArtistProfile: CollectionConfig = {
  slug: 'artist-profile',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tagline'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicRead,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'portraitImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'principles',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
    {
      name: 'timeline',
      type: 'array',
      fields: [
        {
          name: 'year',
          type: 'number',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'richText',
        },
      ],
    },
    {
      name: 'pressQuotes',
      type: 'array',
      fields: [
        {
          name: 'quote',
          type: 'text',
        },
        {
          name: 'author',
          type: 'text',
        },
        {
          name: 'publication',
          type: 'text',
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'tiktok',
          type: 'text',
        },
        {
          name: 'youtube',
          type: 'text',
        },
        {
          name: 'soundcloud',
          type: 'text',
        },
        {
          name: 'linktree',
          type: 'text',
          admin: {
            description: 'Public Linktree URL — shown as a pill next to the logo on every page.',
          },
        },
        {
          name: 'streamUrl',
          type: 'text',
          admin: {
            description:
              'Artist-wide stream landing page — used by the "Find the music everywhere" button on the music page. Typically a Linktree, Songwhip, or distributor aggregator.',
            placeholder: 'https://linktr.ee/poshbugati',
          },
        },
      ],
    },
    {
      name: 'contactEmails',
      type: 'group',
      fields: [
        {
          name: 'general',
          type: 'email',
        },
        {
          name: 'booking',
          type: 'email',
        },
        {
          name: 'press',
          type: 'email',
        },
      ],
    },
  ],
}
