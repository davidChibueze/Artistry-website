import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding database...')

  try {
    // Create first admin user
    console.log('Creating admin user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@poshbugati.com',
        password: 'password123',
        name: 'Admin',
        role: 'admin',
      },
    })

    // Artist Profile
    console.log('Creating artist profile...')
    await payload.create({
      collection: 'artist-profile',
      data: {
        name: 'Poshbugati',
        tagline: 'Afro Country Artist',
        bio: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Poshbugati is pioneering the Afro Country genre, blending African rhythms with country music storytelling. With a unique sound that transcends boundaries, Poshbugati is bringing a fresh perspective to the music world.',
                    version: 2,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        principles: [
          {
            icon: 'authenticity',
            title: 'Authenticity',
            description: 'Stay true to the roots of both African and country music traditions.',
          },
          {
            icon: 'innovation',
            title: 'Innovation',
            description: 'Push boundaries by blending genres that have never been combined before.',
          },
          {
            icon: 'community',
            title: 'Community',
            description: 'Build a global community of fans who appreciate cross-cultural music.',
          },
        ],
        socialLinks: {
          instagram: '#',
          tiktok: '#',
          youtube: '#',
          soundcloud: '#',
        },
        contactEmails: {
          general: 'info@poshbugati.com',
          booking: 'booking@poshbugati.com',
          press: 'press@poshbugati.com',
        },
      },
    })

    // Release - The Switch EP
    console.log('Creating release...')
    const release = await payload.create({
      collection: 'releases',
      data: {
        title: 'The Switch',
        type: 'EP',
        releaseDate: '2025-05-22',
        description: 'Debut EP from Poshbugati, featuring 5 tracks that define the Afro Country genre.',
        featured: true,
        tracks: [
          {
            number: 1,
            title: 'The Switch',
            duration: '3:45',
            badge: 'Single',
            previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          },
          {
            number: 2,
            title: 'Country Roads',
            duration: '4:12',
            previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          },
          {
            number: 3,
            title: 'Lagos to Nashville',
            duration: '3:58',
            previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          },
          {
            number: 4,
            title: 'Afro Sunset',
            duration: '4:30',
            previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          },
          {
            number: 5,
            title: 'Home Again',
            duration: '3:22',
            previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          },
        ],
        streamingLinks: [
          {
            platform: 'Spotify',
            url: '#',
          },
          {
            platform: 'Apple Music',
            url: '#',
          },
          {
            platform: 'YouTube Music',
            url: '#',
          },
        ],
        distributionTiers: [
          {
            label: 'MP3 Download',
            description: 'High quality MP3 files',
            price: 9.99,
            currency: 'USD',
          },
          {
            label: 'WAV Download',
            description: 'Lossless WAV files',
            price: 14.99,
            currency: 'USD',
          },
          {
            label: 'Complete Bundle',
            description: 'MP3 + WAV + Bonus Tracks',
            price: 19.99,
            currency: 'USD',
          },
        ],
      },
    })

    // Tour Shows
    console.log('Creating tour shows...')
    const shows = [
      { venue: 'The Grand Ole Opry', city: 'Nashville', country: 'USA', date: '2025-06-15', time: '8:00 PM', type: 'Headline' },
      { venue: 'Afro Nation', city: 'Lagos', country: 'Nigeria', date: '2025-07-20', time: '9:00 PM', type: 'Festival' },
      { venue: 'The Troubadour', city: 'Los Angeles', country: 'USA', date: '2025-08-10', time: '7:30 PM', type: 'Headline' },
      { venue: 'Brixton Academy', city: 'London', country: 'UK', date: '2025-09-05', time: '8:00 PM', type: 'Headline' },
      { venue: 'Paradiso', city: 'Amsterdam', country: 'Netherlands', date: '2025-09-12', time: '8:30 PM', type: 'Headline' },
      { venue: 'The Fillmore', city: 'San Francisco', country: 'USA', date: '2025-10-01', time: '7:00 PM', type: 'Headline' },
      { venue: 'Red Rocks', city: 'Denver', country: 'USA', date: '2025-10-15', time: '6:00 PM', type: 'Festival' },
      { venue: 'The Ryman', city: 'Nashville', country: 'USA', date: '2025-11-20', time: '8:00 PM', type: 'Headline' },
    ]

    for (const show of shows) {
      await payload.create({
        collection: 'tour-shows',
        data: show,
      })
    }

    // Blog Posts
    console.log('Creating blog posts...')
    const posts = [
      {
        title: 'Announcing The Switch EP',
        category: 'News',
        excerpt: 'Our debut EP is coming May 22, 2025. Here is everything you need to know.',
        publishedDate: '2025-04-01',
        featured: true,
        published: true,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'We are thrilled to announce that our debut EP "The Switch" will be released on May 22, 2025. This project represents months of hard work and creative exploration, blending Afro rhythms with country storytelling in ways that have never been done before.',
                    version: 2,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        title: 'Behind the Scenes: Recording The Switch',
        category: 'Studio',
        excerpt: 'A look inside the studio sessions that shaped our debut EP.',
        publishedDate: '2025-03-15',
        published: true,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Recording The Switch was an incredible journey. We spent weeks in the studio experimenting with different sounds, instruments, and production techniques to create the perfect Afro Country sound.',
                    version: 2,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        title: 'Tour Dates Announced',
        category: 'Tour',
        excerpt: 'We are hitting the road this summer. Check out the full list of dates.',
        publishedDate: '2025-04-10',
        published: true,
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'We are excited to announce our first headlining tour! We will be performing in cities across the US, Europe, and Africa. Tickets go on sale next week.',
                    version: 2,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    ]

    for (const post of posts) {
      await payload.create({
        collection: 'blog-posts',
        data: post,
      })
    }

    // Podcast Episodes
    console.log('Creating podcast episodes...')
    const episodes = [
      { episodeNumber: 7, title: 'Finding the Afro Country Sound', publishDate: '2025-01-15', duration: '45:30', tags: ['music', 'genre', 'creativity'] },
      { episodeNumber: 8, title: 'Collaborating Across Cultures', publishDate: '2025-02-01', duration: '52:15', tags: ['collaboration', 'culture'] },
      { episodeNumber: 9, title: 'The Business of Independent Music', publishDate: '2025-02-15', duration: '48:00', tags: ['business', 'independent'] },
      { episodeNumber: 10, title: 'Building a Fanbase from Scratch', publishDate: '2025-03-01', duration: '41:20', tags: ['fans', 'marketing'] },
      { episodeNumber: 11, title: 'Studio Stories and Creative Process', publishDate: '2025-03-15', duration: '55:45', tags: ['studio', 'creative'] },
      { episodeNumber: 12, title: 'Looking Ahead: Tour and Beyond', publishDate: '2025-04-01', duration: '43:10', tags: ['tour', 'future'] },
    ]

    for (const episode of episodes) {
      await payload.create({
        collection: 'podcast-episodes',
        data: {
          ...episode,
          description: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: `Episode ${episode.episodeNumber} of Between Two Sounds.`,
                      version: 2,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  textFormat: 0,
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          tags: episode.tags.map((tag) => ({ tag })),
        },
      })
    }

    // Podcast Stats
    console.log('Creating podcast stats...')
    await payload.create({
      collection: 'podcast-stats',
      data: {
        totalEpisodes: 12,
        totalListeners: 50000,
        averageRating: 4.8,
        description: 'Between Two Sounds is a podcast exploring the intersection of music, culture, and creativity.',
      },
    })

    // Merch Products
    console.log('Creating merch products...')
    const merchProducts = [
      { name: 'The Switch EP Tee', category: 'Apparel', price: 35, inStock: true, badge: 'New' },
      { name: 'Afro Country Hat', category: 'Apparel', price: 25, inStock: true },
      { name: 'The Switch EP (Digital)', category: 'Music', price: 9.99, inStock: true },
      { name: 'The Switch EP (WAV)', category: 'Music', price: 14.99, inStock: true },
      { name: 'Poshbugati Sticker Pack', category: 'Accessory', price: 5, inStock: true },
      { name: 'Complete Bundle', category: 'Bundle', price: 120, inStock: true, badge: 'Limited Edition', featured: true },
    ]

    for (const product of merchProducts) {
      await payload.create({
        collection: 'merch-products',
        data: product,
      })
    }

    console.log('Seeding complete!')
    console.log('Admin user: admin@poshbugati.com / password123')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()
