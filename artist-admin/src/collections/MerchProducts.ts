import type { CollectionConfig } from 'payload'

import { generateSlug } from '../hooks/generateSlug'
import { isAdminOrEditor, publicRead } from '../access/roles'

export const MerchProducts: CollectionConfig = {
  slug: 'merch-products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'inStock', 'featured'],
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
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      index: true,
      hooks: {
        beforeChange: [generateSlug('name')],
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Apparel', value: 'Apparel' },
        { label: 'Music', value: 'Music' },
        { label: 'Digital', value: 'Digital' },
        { label: 'Bundle', value: 'Bundle' },
        { label: 'Accessory', value: 'Accessory' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'variants',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'options',
          type: 'array',
          fields: [
            {
              name: 'option',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'badge',
      type: 'text',
    },
    {
      name: 'featured',
      type: 'checkbox',
    },
  ],
}
