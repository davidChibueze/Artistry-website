import type { FieldHook } from 'payload'

export const generateSlug = (titleField: string = 'title'): FieldHook => {
  return async ({ data, operation, value }) => {
    if (operation === 'create' || (operation === 'update' && data?.title)) {
      const title = data?.title || value
      if (title && typeof title === 'string') {
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        return slug
      }
    }
    return value
  }
}
