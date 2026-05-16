import type { CollectionConfig } from 'payload'

import { generateOrderNumber } from '../hooks/generateOrderNumber'
import { generateDownloadToken } from '../hooks/generateDownloadToken'
import { generateLookupToken } from '../hooks/generateLookupToken'
import { noPublicAccess } from '../access/roles'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'customerEmail',
      'total',
      'displayCurrency',
      'status',
      'paymentProvider',
      'createdAt',
    ],
  },
  access: noPublicAccess,
  hooks: {
    beforeChange: [generateOrderNumber, generateLookupToken],
    afterChange: [generateDownloadToken],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'customerName',
      type: 'text',
    },
    {
      name: 'shippingAddress',
      type: 'group',
      admin: {
        description: 'Required for physical goods. Leave empty for digital-only orders.',
      },
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'phone', type: 'text' },
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
        {
          name: 'productId',
          type: 'text',
          admin: {
            description: 'Source merch-products or releases doc ID at the time of purchase.',
          },
        },
        {
          name: 'variantId',
          type: 'text',
          admin: {
            description: 'For merch with variants, the chosen variant array row ID.',
          },
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'variantLabel',
          type: 'text',
          admin: {
            description: 'Human-readable variant description, e.g. "Size: M / Color: Black".',
          },
        },
        {
          name: 'sku',
          type: 'text',
        },
        {
          type: 'row',
          fields: [
            { name: 'priceUSD', type: 'number', required: true, min: 0 },
            { name: 'priceNGN', type: 'number', required: true, min: 0 },
          ],
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
          min: 1,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Sum of line items in displayCurrency, before shipping/tax.',
          },
        },
        {
          name: 'shipping',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
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
      admin: {
        description: 'Currency the customer saw at checkout. subtotal/shipping/total are in this currency.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'Pending Payment',
      index: true,
      options: [
        { label: 'Pending Payment', value: 'Pending Payment' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Fulfilled', value: 'Fulfilled' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Refunded', value: 'Refunded' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Expired', value: 'Expired' },
      ],
    },
    {
      name: 'paymentProvider',
      type: 'select',
      options: [
        { label: 'Credo', value: 'credo' },
        { label: 'PayPal', value: 'paypal' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paidCurrency',
          type: 'select',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'NGN', value: 'NGN' },
          ],
          admin: {
            description: 'Currency the payment was actually captured in.',
          },
        },
        {
          name: 'paidAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Amount actually captured in paidCurrency.',
          },
        },
      ],
    },
    {
      name: 'credoReference',
      type: 'text',
      admin: {
        description: "Credo transRef used for verification.",
      },
    },
    {
      name: 'credoAuthorizationUrl',
      type: 'text',
      admin: {
        description: 'URL to redirect the customer to complete a Credo payment.',
      },
    },
    {
      name: 'paypalOrderId',
      type: 'text',
      index: true,
      admin: {
        description: 'PayPal Orders v2 order ID returned by createOrder.',
      },
    },
    {
      name: 'paypalCaptureId',
      type: 'text',
      admin: {
        description: 'PayPal capture ID returned by captureOrder.',
      },
    },
    {
      name: 'lookupToken',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Unguessable token for self-service order status lookup.',
      },
    },
    {
      name: 'customerToken',
      type: 'text',
      index: true,
      admin: {
        description: 'Per-browser identifier copied from the cart cookie. Used to build per-browser order history without auth.',
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
      name: 'resendEmailUi',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/ResendOrderEmail',
        },
      },
    },
    {
      name: 'emailsSent',
      type: 'array',
      admin: {
        description: 'Idempotency record of transactional emails fired for this order.',
        readOnly: true,
      },
      fields: [
        { name: 'templateKey', type: 'text' },
        { name: 'sentAt', type: 'date' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes. Not shown to the customer.',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
