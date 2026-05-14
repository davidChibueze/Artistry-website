import type { CollectionBeforeChangeHook } from 'payload'

export const calculateReadTime: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' || operation === 'update') {
    const content = data?.content
    if (content && typeof content === 'object') {
      const text = JSON.stringify(content)
      const wordCount = text.split(/\s+/).length
      const readTime = Math.max(1, Math.ceil(wordCount / 200))
      data.readTime = readTime
    }
  }
  return data
}
