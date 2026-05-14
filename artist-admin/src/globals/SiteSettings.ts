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
  ],
}
