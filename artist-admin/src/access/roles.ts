import type { Access } from 'payload'
import type { User } from '@/payload-types'

type Role = 'admin' | 'editor' | 'viewer'

export const isAdmin: Access<User> = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'admin'
}

export const isAdminOrEditor: Access<User> = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'admin' || user.role === 'editor'
}

export const isAdminOrEditorOrViewer: Access<User> = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'admin' || user.role === 'editor' || user.role === 'viewer'
}

export const authenticatedWithRole: Access<User> = ({ req: { user } }) => {
  return Boolean(user)
}

export const publicRead: Access = () => true

export const publicReadWhenPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    published: { equals: true },
  }
}

export const adminFullAccess = (role: Role = 'admin') => ({
  create: role === 'admin' ? isAdmin : isAdminOrEditor,
  read: isAdminOrEditorOrViewer,
  update: role === 'admin' ? isAdmin : isAdminOrEditor,
  delete: isAdmin,
})

export const publicReadAdminWrite = {
  create: isAdminOrEditor,
  read: publicRead,
  update: isAdminOrEditor,
  delete: isAdmin,
}

export const publicReadWhenPublishedAdminWrite = {
  create: isAdminOrEditor,
  read: publicReadWhenPublished,
  update: isAdminOrEditor,
  delete: isAdmin,
}

export const noPublicAccess = {
  create: () => false,
  read: isAdminOrEditorOrViewer,
  update: isAdminOrEditor,
  delete: isAdmin,
}

export const publicCreateOnly = {
  create: () => true,
  read: isAdminOrEditorOrViewer,
  update: isAdminOrEditor,
  delete: isAdmin,
}
