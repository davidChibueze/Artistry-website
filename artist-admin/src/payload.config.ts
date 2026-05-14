import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { ArtistProfile } from './collections/ArtistProfile'
import { BlogPosts } from './collections/BlogPosts'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Media } from './collections/Media'
import { MediaGallery } from './collections/MediaGallery'
import { MerchProducts } from './collections/MerchProducts'
import { Orders } from './collections/Orders'
import { PodcastEpisodes } from './collections/PodcastEpisodes'
import { PodcastStats } from './collections/PodcastStats'
import { Releases } from './collections/Releases'
import { Subscriptions } from './collections/Subscriptions'
import { TourShows } from './collections/TourShows'
import { Users } from './collections/Users'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { credoCallback } from './endpoints/credo/callback'
import { credoWebhook } from './endpoints/credo/webhook'
import { emailBroadcast } from './endpoints/email/broadcast'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Poshbugati Admin',
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    ArtistProfile,
    Releases,
    TourShows,
    BlogPosts,
    PodcastEpisodes,
    PodcastStats,
    MerchProducts,
    MediaGallery,
    Subscriptions,
    ContactSubmissions,
    Orders,
    Media,
    Users,
  ],
  globals: [SiteSettings, Navigation],
  endpoints: [credoCallback, credoWebhook, emailBroadcast],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
