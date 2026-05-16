import type { GlobalConfig } from 'payload'

import { isAdminOrEditor, publicRead } from '../access/roles'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: publicRead,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      admin: {
        description:
          'Site-wide navigation links. Use the Locations field on each item to control whether it appears in the header, footer, or both.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'locations',
          type: 'select',
          hasMany: true,
          defaultValue: ['header'],
          options: [
            { label: 'Header', value: 'header' },
            { label: 'Footer', value: 'footer' },
          ],
          admin: {
            description:
              "Where this link appears. Leave empty to hide everywhere without deleting the row.",
          },
        },
        {
          name: 'footerColumn',
          type: 'text',
          admin: {
            description:
              'Only used when Footer is selected above. Items sharing the same column heading group together — e.g. type "Music" on three items and they appear in one column titled Music. Leave blank to fall under a default "Links" column.',
            placeholder: 'Music',
          },
        },
        {
          name: 'external',
          type: 'checkbox',
        },
        {
          name: 'cta',
          type: 'checkbox',
        },
      ],
    },
  ],
}
