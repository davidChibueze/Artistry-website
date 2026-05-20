import type { GlobalConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: publicRead,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
    },
    {
      name: 'siteDescription',
      type: 'text',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'announcementBar',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
        },
        {
          name: 'text',
          type: 'text',
        },
        {
          name: 'linkText',
          type: 'text',
        },
        {
          name: 'linkUrl',
          type: 'text',
        },
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
      ],
    },
    {
      name: 'heroRelease',
      type: 'relationship',
      relationTo: 'releases',
      admin: {
        description:
          'The release shown in the "Latest Release" section on /music. Leave empty to auto-select the first featured release, or the most recent release.',
      },
    },
    {
      name: 'epReleaseDate',
      type: 'date',
    },
    {
      name: 'cdnUrl',
      type: 'text',
    },
    {
      name: 'footerText',
      type: 'text',
    },
    {
      name: 'featuredVideoId',
      type: 'text',
      admin: {
        description: 'YouTube video ID (the part after ?v= in the URL). Example: VBStMoVYZS4',
      },
    },
    {
      name: 'featuredVideoTitle',
      type: 'text',
      admin: {
        description: 'Display title shown below the video embed on the homepage.',
      },
    },
  ],
}
