import type { CollectionConfig } from 'payload'

import { generateSlug } from '../hooks/generateSlug'
import { isAdminOrEditor, publicRead } from '../access/roles'

export const MerchProducts: CollectionConfig = {
  slug: 'merch-products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'priceUSD', 'priceNGN', 'inStock', 'featured'],
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
      name: 'fxHint',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/FxHint',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceUSD',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Default USD price. Charged to PayPal customers and shown to non-NG visitors.',
          },
        },
        {
          name: 'priceNGN',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Default NGN price. Charged to Credo customers and shown to NG visitors.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'compareAtPriceUSD',
          type: 'number',
          min: 0,
          admin: {
            description: 'Original USD price for strike-through display. Leave blank if not on sale.',
          },
        },
        {
          name: 'compareAtPriceNGN',
          type: 'number',
          min: 0,
          admin: {
            description: 'Original NGN price for strike-through display.',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'optionTypes',
      type: 'array',
      labels: {
        singular: 'Option type',
        plural: 'Option types',
      },
      admin: {
        description:
          'Define the axes of variation (e.g. Size, Color). Each variant below must specify a value for every option type.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { placeholder: 'Size' },
        },
        {
          name: 'values',
          type: 'array',
          labels: { singular: 'Value', plural: 'Values' },
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { placeholder: 'M' },
            },
          ],
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      labels: {
        singular: 'Variant',
        plural: 'Variants',
      },
      admin: {
        description:
          'Each row is a sellable SKU. Provide a value for every option type defined above.',
      },
      fields: [
        {
          name: 'optionValues',
          type: 'array',
          labels: { singular: 'Option', plural: 'Options' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'Size' },
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'M' },
                },
              ],
            },
          ],
        },
        {
          name: 'sku',
          type: 'text',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'priceUSD',
              type: 'number',
              required: true,
              min: 0,
            },
            {
              name: 'priceNGN',
              type: 'number',
              required: true,
              min: 0,
            },
          ],
        },
        {
          name: 'stock',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'available',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Manual override. When unchecked, the product is hidden from the storefront regardless of variant stock.',
      },
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
