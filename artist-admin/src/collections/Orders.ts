import type { CollectionConfig } from 'payload'

import { generateOrderNumber } from '../hooks/generateOrderNumber'
import { generateDownloadToken } from '../hooks/generateDownloadToken'
import { noPublicAccess } from '../access/roles'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerEmail', 'total', 'status', 'createdAt'],
  },
  access: noPublicAccess,
  hooks: {
    beforeChange: [generateOrderNumber],
    afterChange: [generateDownloadToken],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'customerName',
      type: 'text',
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
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'Pending Payment',
      options: [
        { label: 'Pending Payment', value: 'Pending Payment' },
        { label: 'Complete', value: 'Complete' },
        { label: 'Refunded', value: 'Refunded' },
        { label: 'Expired', value: 'Expired' },
      ],
    },
    {
      name: 'credoReference',
      type: 'text',
      admin: {
        description: "Credo's internal transaction reference (transRef) used for verification",
      },
    },
    {
      name: 'credoAuthorizationUrl',
      type: 'text',
      admin: {
        description: 'URL to redirect the customer to complete payment',
      },
    },
    {
      name: 'downloadToken',
      type: 'text',
    },
    {
      name: 'downloadExpiresAt',
      type: 'date',
    },
    {
      name: 'downloadCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'createdAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
