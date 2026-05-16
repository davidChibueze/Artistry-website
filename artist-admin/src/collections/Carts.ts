import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isAdminOrEditorOrViewer, isAdmin } from '../access/roles'

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    useAsTitle: 'cartId',
    defaultColumns: ['cartId', 'customerEmail', 'displayCurrency', 'itemCount', 'lastActivityAt'],
    description:
      'Anonymous shopping carts. Read/write happens through public cart endpoints authorized by the cart_id cookie — never directly via admin UI.',
  },
  access: {
    create: () => false,
    read: isAdminOrEditorOrViewer,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'cartId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'customerEmail',
      type: 'email',
      index: true,
    },
    {
      name: 'customerToken',
      type: 'text',
      index: true,
      admin: {
        description: 'Long-lived per-browser identifier. Copied into Orders.customerToken at checkout.',
      },
    },
    {
      name: 'displayCurrency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'NGN', value: 'NGN' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Track', value: 'Track' },
            { label: 'EP', value: 'EP' },
            { label: 'Merch', value: 'Merch' },
          ],
        },
        { name: 'productId', type: 'text', required: true },
        { name: 'variantId', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'variantLabel', type: 'text' },
        { name: 'sku', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'priceUSD', type: 'number', required: true, min: 0 },
            { name: 'priceNGN', type: 'number', required: true, min: 0 },
          ],
        },
        { name: 'quantity', type: 'number', defaultValue: 1, min: 1 },
        { name: 'imageUrl', type: 'text' },
      ],
    },
    {
      name: 'itemCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'lastActivityAt',
      type: 'date',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'abandonedEmailSentAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        data.lastActivityAt = new Date().toISOString()
        if (Array.isArray(data.items)) {
          data.itemCount = data.items.reduce(
            (sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 1),
            0,
          )
        }
        return data
      },
    ],
  },
}
