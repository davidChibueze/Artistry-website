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
