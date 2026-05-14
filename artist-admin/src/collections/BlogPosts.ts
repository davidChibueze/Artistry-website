import type { CollectionConfig } from 'payload'

import { generateSlug } from '../hooks/generateSlug'
import { calculateReadTime } from '../hooks/calculateReadTime'
import { isAdminOrEditor, publicReadWhenPublished } from '../access/roles'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedDate', 'published', 'featured'],
  },
  access: {
    create: isAdminOrEditor,
    read: publicReadWhenPublished,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [calculateReadTime],
  },
  fields: [
    {
      name: 'title',
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
        beforeChange: [generateSlug('title')],
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Tour', value: 'Tour' },
        { label: 'Studio', value: 'Studio' },
        { label: 'Personal', value: 'Personal' },
        { label: 'News', value: 'News' },
        { label: 'Behind The Scenes', value: 'Behind The Scenes' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'excerpt',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
    },
    {
      name: 'readTime',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated from content length (~200 words per minute)',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  versions: {
    drafts: true,
  },
}
