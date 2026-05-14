# Poshbugati API Documentation

> For frontend developers integrating with the Payload CMS backend.

## Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:3000/api` |
| Production | `https://poshbugati.com/api` |

All API endpoints are prefixed with `/api`.

---

## Table of Contents

- [Authentication](#authentication)
- [Query Parameters](#query-parameters)
- [Collections (REST API)](#collections-rest-api)
  - [Artist Profile](#artist-profile)
  - [Releases](#releases)
  - [Tour Shows](#tour-shows)
  - [Blog Posts](#blog-posts)
  - [Podcast Episodes](#podcast-episodes)
  - [Podcast Stats](#podcast-stats)
  - [Merch Products](#merch-products)
  - [Media Gallery](#media-gallery)
  - [Media (Uploads)](#media-uploads)
- [Globals](#globals)
  - [Site Settings](#site-settings)
  - [Navigation](#navigation)
- [Public Write Endpoints](#public-write-endpoints)
  - [Subscriptions](#subscriptions)
  - [Contact Form](#contact-form)
- [Payments (Credo)](#payments-credo)
  - [Initialize Payment](#initialize-payment)
  - [Payment Callback](#payment-callback)
  - [Payment Webhook](#payment-webhook)
- [Email](#email)
  - [Broadcast](#broadcast)
- [GraphQL](#graphql)
- [TypeScript Types](#typescript-types)

---

## Authentication

Most endpoints are **public read**. Admin-only endpoints require authentication.

### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@poshbugati.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "admin@poshbugati.com",
    "name": "Admin",
    "role": "admin"
  },
  "exp": 1736812800,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token

Include the token in subsequent requests:

```bash
GET /api/orders
Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Logout

```bash
POST /api/users/logout
Authorization: JWT <token>
```

---

## Query Parameters

All collection endpoints support these query parameters:

| Parameter | Type | Description | Example |
|---|---|---|---|
| `where` | Object | Filter results | `?where[featured][equals]=true` |
| `sort` | String | Sort field (prefix `-` for desc) | `?sort=-createdAt` |
| `limit` | Number | Results per page (default 10, max 100) | `?limit=20` |
| `page` | Number | Page number | `?page=2` |
| `depth` | Number | Relationship population depth (0 = IDs only, 2 = default) | `?depth=1` |
| `select` | Object | Field selection | `?select[title]=true&select[slug]=true` |

### Where Operators

| Operator | Description | Example |
|---|---|---|
| `equals` | Exact match | `?where[type][equals]=EP` |
| `not_equals` | Not equal | `?where[status][not_equals]=draft` |
| `contains` | Partial string match | `?where[title][contains]=switch` |
| `like` | Case-insensitive partial match | `?where[city][like]=lagos` |
| `in` | Match any value | `?where[category][in]=Tour,Studio` |
| `not_in` | Exclude values | `?where[status][not_in]=draft,archived` |
| `exists` | Field exists | `?where[coverImage][exists]=true` |
| `greater_than` | Greater than | `?where[price][greater_than]=50` |
| `greater_than_equal` | >= | `?where[releaseDate][greater_than_equal]=2025-01-01` |
| `less_than` | Less than | `?where[price][less_than]=100` |
| `less_than_equal` | <= | `?where[releaseDate][less_than_equal]=2025-12-31` |
| `between` | Range | `?where[price][between]=10,50` |
| `near` | Geospatial (point fields) | `?where[location][near]=-74,40,10000` |

### AND / OR Logic

```
?where[or][0][type][equals]=Headline&where[or][1][type][equals]=Festival
```

---

## Collections (REST API)

### Artist Profile

Single document with artist bio, images, social links.

**Access:** Public read, admin write

#### Get Artist Profile

```bash
GET /api/artist-profile
```

**Response:**

```json
{
  "docs": [
    {
      "id": 1,
      "name": "Poshbugati",
      "tagline": "Afro Country Artist",
      "bio": { "root": { ... } },
      "heroImage": { "id": 5, "url": "/media/hero.jpg", "alt": "..." },
      "portraitImage": { "id": 6, "url": "/media/portrait.jpg" },
      "principles": [
        { "icon": "authenticity", "title": "Authenticity", "description": "..." }
      ],
      "timeline": [
        { "year": 2024, "title": "Debut EP", "description": { ... } }
      ],
      "pressQuotes": [
        { "quote": "Revolutionary sound.", "author": "John Doe", "publication": "Music Weekly" }
      ],
      "socialLinks": {
        "instagram": "https://instagram.com/poshbugati",
        "tiktok": "https://tiktok.com/@poshbugati",
        "youtube": "https://youtube.com/@poshbugati",
        "soundcloud": "https://soundcloud.com/poshbugati"
      },
      "contactEmails": {
        "general": "info@poshbugati.com",
        "booking": "booking@poshbugati.com",
        "press": "press@poshbugati.com"
      }
    }
  ],
  "totalDocs": 1,
  "page": 1,
  "totalPages": 1
}
```

---

### Releases

Music releases (EPs, albums, singles) with tracks, streaming links, and purchase tiers.

**Access:** Public read, admin write

#### Get All Releases

```bash
GET /api/releases
```

#### Get Featured Releases

```bash
GET /api/releases?where[featured][equals]=true&sort=-releaseDate
```

#### Get Single Release

```bash
GET /api/releases/:id
# or by slug
GET /api/releases?where[slug][equals]=the-switch&limit=1
```

#### Filter by Type

```bash
GET /api/releases?where[type][equals]=EP
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "title": "The Switch",
      "slug": "the-switch",
      "type": "EP",
      "coverImage": { "id": 10, "url": "/media/cover.jpg", "sizes": { "thumbnail": { "url": "..." } } },
      "releaseDate": "2025-05-22T00:00:00.000Z",
      "description": "Debut EP...",
      "featured": true,
      "tracks": [
        {
          "number": 1,
          "title": "The Switch",
          "subtitle": null,
          "duration": "3:45",
          "badge": "Single",
          "previewUrl": "https://...",
          "audioFile": null
        }
      ],
      "streamingLinks": [
        { "platform": "Spotify", "url": "https://open.spotify.com/..." },
        { "platform": "Apple Music", "url": "https://music.apple.com/..." }
      ],
      "distributionTiers": [
        { "label": "MP3 Download", "description": "High quality MP3", "price": 9.99, "currency": "USD" }
      ]
    }
  ]
}
```

---

### Tour Shows

Tour dates with venue, city, date, and ticket links.

**Access:** Public read, admin write

#### Get Upcoming Shows

```bash
GET /api/tour-shows?where[date][greater_than_equal]=2025-05-13&sort=date
```

#### Get All Shows

```bash
GET /api/tour-shows?sort=-date
```

#### Filter by Type

```bash
GET /api/tour-shows?where[type][equals]=Festival
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "venue": "The Grand Ole Opry",
      "city": "Nashville",
      "country": "USA",
      "date": "2025-06-15T00:00:00.000Z",
      "time": "8:00 PM",
      "type": "Headline",
      "soldOut": false,
      "ticketUrl": "https://...",
      "notes": null
    }
  ]
}
```

---

### Blog Posts

Journal/blog entries with draft/publish workflow.

**Access:** Public read when `published=true`, admin write

#### Get Published Posts

```bash
GET /api/blog-posts?where[published][equals]=true&sort=-publishedDate
```

#### Get Featured Post

```bash
GET /api/blog-posts?where[featured][equals]=true&where[published][equals]=true&limit=1
```

#### Filter by Category

```bash
GET /api/blog-posts?where[category][equals]=Tour&where[published][equals]=true
```

#### Get Single Post

```bash
GET /api/blog-posts/:id
# or by slug
GET /api/blog-posts?where[slug][equals]=announcing-the-switch&limit=1
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "title": "Announcing The Switch EP",
      "slug": "announcing-the-switch-ep",
      "coverImage": { "id": 15, "url": "/media/blog-cover.jpg" },
      "category": "News",
      "excerpt": "Our debut EP is coming May 22, 2025...",
      "content": { "root": { ... } },
      "publishedDate": "2025-04-01T00:00:00.000Z",
      "featured": true,
      "readTime": 3,
      "published": true,
      "_status": "published"
    }
  ]
}
```

#### Rendering Rich Text Content

Blog post `content` is in Lexical JSON format. Use `@payloadcms/richtext-lexical/react` to render:

```tsx
import { JSX } from '@payloadcms/richtext-lexical/react'

function BlogPost({ post }: { post: BlogPost }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <JSX.Node node={post.content.root} />
    </article>
  )
}
```

Or convert to HTML on the backend with a custom endpoint.

---

### Podcast Episodes

"Between Two Sounds" podcast episodes.

**Access:** Public read, admin write

#### Get All Episodes

```bash
GET /api/podcast-episodes?sort=-episodeNumber
```

#### Get Featured Episodes

```bash
GET /api/podcast-episodes?where[featured][equals]=true
```

#### Get Single Episode

```bash
GET /api/podcast-episodes/:id
# or by episode number
GET /api/podcast-episodes?where[episodeNumber][equals]=7&limit=1
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "episodeNumber": 7,
      "title": "Finding the Afro Country Sound",
      "description": { "root": { ... } },
      "publishDate": "2025-01-15T00:00:00.000Z",
      "duration": "45:30",
      "audioUrl": "https://...",
      "guestName": null,
      "guestBio": null,
      "tags": [
        { "tag": "music", "id": "..." },
        { "tag": "genre", "id": "..." }
      ],
      "featured": false
    }
  ]
}
```

---

### Podcast Stats

Single document with podcast statistics.

**Access:** Public read, admin write

```bash
GET /api/podcast-stats
```

**Response:**

```json
{
  "docs": [
    {
      "id": 1,
      "totalEpisodes": 12,
      "totalListeners": 50000,
      "averageRating": 4.8,
      "description": "Between Two Sounds is a podcast..."
    }
  ]
}
```

---

### Merch Products

Merchandise store items with variants and pricing.

**Access:** Public read, admin write

#### Get All Products

```bash
GET /api/merch-products?where[inStock][equals]=true
```

#### Get Featured Products

```bash
GET /api/merch-products?where[featured][equals]=true
```

#### Filter by Category

```bash
GET /api/merch-products?where[category][equals]=Apparel
```

#### Get Single Product

```bash
GET /api/merch-products/:id
# or by slug
GET /api/merch-products?where[slug][equals]=the-switch-ep-tee&limit=1
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "name": "The Switch EP Tee",
      "slug": "the-switch-ep-tee",
      "images": [
        { "image": { "id": 20, "url": "/media/tee-front.jpg" } }
      ],
      "category": "Apparel",
      "price": 35,
      "compareAtPrice": null,
      "description": { "root": { ... } },
      "variants": [
        {
          "name": "Size",
          "options": [
            { "option": "S", "id": "..." },
            { "option": "M", "id": "..." },
            { "option": "L", "id": "..." },
            { "option": "XL", "id": "..." }
          ]
        }
      ],
      "inStock": true,
      "badge": "New",
      "featured": false
    }
  ]
}
```

---

### Media Gallery

Press photos, videos, press quotes, and EPK downloads.

**Access:** Public read, admin write

#### Get All Media

```bash
GET /api/media-gallery?sort=order
```

#### Filter by Type

```bash
GET /api/media-gallery?where[type][equals]=Photo
GET /api/media-gallery?where[type][equals]=Video
GET /api/media-gallery?where[type][equals]=Press%20Quote
GET /api/media-gallery?where[type][equals]=EPK%20Download
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "type": "Photo",
      "title": "Press Photo 1",
      "file": { "id": 25, "url": "/media/press-1.jpg", "sizes": { ... } },
      "order": 1
    },
    {
      "id": 2,
      "type": "Video",
      "title": "Music Video",
      "thumbnail": { "id": 26, "url": "/media/video-thumb.jpg" },
      "videoUrl": "https://youtube.com/embed/...",
      "order": 2
    },
    {
      "id": 3,
      "type": "Press Quote",
      "quote": { "root": { ... } },
      "publication": "Music Weekly",
      "author": "Jane Smith",
      "order": 3
    }
  ]
}
```

---

### Media (Uploads)

Uploaded files (images, audio, documents).

**Access:** Public read, admin write

#### Get All Media

```bash
GET /api/media
```

#### Filter by Category

```bash
GET /api/media?where[category][equals]=Release%20Cover
GET /api/media?where[category][equals]=Press%20Photo
```

#### Response

```json
{
  "docs": [
    {
      "id": 1,
      "alt": "The Switch EP Cover",
      "caption": null,
      "category": "Release Cover",
      "url": "/media/cover.jpg",
      "filename": "cover.jpg",
      "mimeType": "image/jpeg",
      "filesize": 245000,
      "width": 1600,
      "height": 1600,
      "sizes": {
        "thumbnail": { "url": "/media/cover-400x400.jpg", "width": 400, "height": 400 },
        "medium": { "url": "/media/cover-800x800.jpg", "width": 800, "height": 800 },
        "large": { "url": "/media/cover-1600x1600.jpg", "width": 1600, "height": 1600 }
      }
    }
  ]
}
```

---

## Globals

Globals are single-instance configs. They return a single object, not a paginated list.

### Site Settings

Site-wide configuration.

```bash
GET /api/globals/site-settings
```

**Response:**

```json
{
  "id": 1,
  "siteTitle": "Poshbugati",
  "siteDescription": "Afro Country Artist...",
  "ogImage": { "id": 30, "url": "/media/og.jpg" },
  "announcementBar": {
    "enabled": true,
    "text": "The Switch EP out now!",
    "linkText": "Listen Now",
    "linkUrl": "/releases/the-switch",
    "startDate": "2025-05-22T00:00:00.000Z",
    "endDate": "2025-06-22T00:00:00.000Z"
  },
  "epReleaseDate": "2025-05-22T00:00:00.000Z",
  "cdnUrl": "cdn.poshbugati.com",
  "footerText": "© 2025 Poshbugati. All rights reserved."
}
```

### Navigation

Main navigation links.

```bash
GET /api/globals/navigation
```

**Response:**

```json
{
  "id": 1,
  "navItems": [
    { "label": "Home", "url": "/", "external": false, "cta": false },
    { "label": "Music", "url": "/music", "external": false, "cta": false },
    { "label": "Tour", "url": "/tour", "external": false, "cta": false },
    { "label": "Merch", "url": "/merch", "external": false, "cta": true },
    { "label": "Contact", "url": "/contact", "external": false, "cta": false }
  ]
}
```

---

## Public Write Endpoints

These endpoints accept public submissions (no authentication required).

### Subscriptions

Add a new subscriber. Triggers an automatic welcome email.

```bash
POST /api/subscriptions
Content-Type: application/json

{
  "email": "fan@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "type": "Newsletter"
}
```

**Response:**

```json
{
  "id": 1,
  "email": "fan@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "type": "Newsletter",
  "subscribedAt": "2025-05-13T10:30:00.000Z",
  "active": true
}
```

**Fields:**

| Field | Required | Type | Values |
|---|---|---|---|
| `email` | Yes | string | Valid email (must be unique) |
| `firstName` | No | string | |
| `lastName` | No | string | |
| `type` | No | string | `Fan Club`, `Newsletter`, `Tour Notifications` |

---

### Contact Form

Submit a contact form inquiry.

```bash
POST /api/contact-submissions
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "organization": "Live Nation",
  "inquiryType": "Booking",
  "eventDate": "2025-08-15",
  "budget": "$50,000",
  "message": "We'd like to book Poshbugati for our summer festival."
}
```

**Response:**

```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "organization": "Live Nation",
  "inquiryType": "Booking",
  "eventDate": "2025-08-15T00:00:00.000Z",
  "budget": "$50,000",
  "message": "We'd like to book Poshbugati for our summer festival.",
  "submittedAt": "2025-05-13T10:30:00.000Z",
  "status": "New"
}
```

**Fields:**

| Field | Required | Type | Values |
|---|---|---|---|
| `name` | Yes | string | |
| `email` | Yes | string | Valid email |
| `organization` | No | string | |
| `inquiryType` | No | string | `Booking`, `Press`, `Collaboration`, `Other` |
| `eventDate` | No | string | ISO date |
| `budget` | No | string | |
| `message` | Yes | string | |

---

## Payments (Credo)

Payment processing via [Credo](https://credocentral.com). Supports Card, Bank Transfer, USSD, and Wallet in NGN and USD.

### Initialize Payment

Create a payment session and get a checkout URL.

```bash
POST /api/credo/initialize
Content-Type: application/json

{
  "amount": 150000,
  "email": "customer@example.com",
  "currency": "NGN",
  "reference": "PB-2025-0001",
  "callbackUrl": "https://poshbugati.com/payment/success",
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "narration": "The Switch EP - MP3 Download"
}
```

**Fields:**

| Field | Required | Type | Description |
|---|---|---|---|
| `amount` | Yes | integer | Amount in lowest unit (kobo for NGN, cents for USD). ₦150.00 = `15000` |
| `email` | Yes | string | Customer email |
| `currency` | Yes | string | `NGN` or `USD` |
| `reference` | Yes | string | Your unique order reference |
| `callbackUrl` | Yes | string | Where to redirect after payment |
| `customerFirstName` | No | string | |
| `customerLastName` | No | string | |
| `customerPhoneNumber` | No | string | |
| `narration` | No | string | Description shown on checkout |
| `metadata` | No | object | Custom key-value pairs |

**Response:**

```json
{
  "status": 200,
  "message": "Transaction initialized successfully",
  "data": {
    "authorizationUrl": "https://pay.credocentral.com/checkout/xxx",
    "reference": "PB-2025-0001",
    "credoReference": "vs_xxxxxxxxxxxx",
    "crn": "0000298483"
  }
}
```

**Flow:**

1. Create an order in the Orders collection (status: `Pending Payment`)
2. Call `/api/credo/initialize` with the order reference
3. Redirect the customer to `authorizationUrl`
4. Customer completes payment on Credo's hosted checkout
5. Credo redirects to your `callbackUrl` with `?transRef=xxx`
6. Verify the payment (see below)

---

### Payment Callback

Verify a completed payment.

```bash
GET /api/credo/callback?transRef=vs_xxxxxxxxxxxx
```

**Response (success):**

```json
{
  "message": "Payment successful",
  "status": "success",
  "orderNumber": "PB-2025-0001",
  "downloadToken": "abc123..."
}
```

**Response (failed):**

```json
{
  "message": "Payment failed",
  "status": "failed"
}
```

---

### Payment Webhook

Credo sends webhook notifications for payment status changes.

```
POST /api/credo/webhook
```

This endpoint is called by Credo's servers. No action needed from the frontend — it automatically verifies the payment and updates the order status.

---

## Email

### Broadcast

Send a bulk email to all subscribers (admin only).

```bash
POST /api/email/broadcast
Authorization: JWT <admin-token>
Content-Type: application/json

{
  "subject": "New EP Out Now!",
  "html": "<h1>The Switch is here!</h1><p>Listen now on all platforms.</p>",
  "text": "The Switch is here! Listen now on all platforms.",
  "type": "Newsletter",
  "batchSize": 50,
  "delayMs": 1000
}
```

**Fields:**

| Field | Required | Type | Default | Description |
|---|---|---|---|---|
| `subject` | Yes | string | | Email subject |
| `html` | Yes | string | | HTML body |
| `text` | No | string | | Plain text fallback |
| `type` | No | string | all | Filter by subscription type |
| `batchSize` | No | number | 50 | Emails per batch |
| `delayMs` | No | number | 1000 | Delay between batches (ms) |

**Response:**

```json
{
  "message": "Broadcast complete",
  "total": 150,
  "successCount": 148,
  "failedCount": 2,
  "failures": [
    { "email": "bad@example.com", "success": false, "error": "Invalid address" }
  ]
}
```

---

## GraphQL

Payload also exposes a GraphQL API at `/api/graphql`.

### Query Examples

```graphql
# Get all published blog posts
query {
  BlogPosts(where: { published: { equals: true } }, sort: "-publishedDate") {
    docs {
      id
      title
      slug
      excerpt
      publishedDate
      readTime
      coverImage {
        url
        alt
      }
    }
    totalDocs
  }
}

# Get upcoming tour shows
query {
  TourShows(where: { date: { greater_than_equal: "2025-05-13" } }, sort: "date") {
    docs {
      id
      venue
      city
      country
      date
      type
      soldOut
      ticketUrl
    }
  }
}

# Get site settings
query {
  SiteSettings {
    siteTitle
    siteDescription
    announcementBar {
      enabled
      text
      linkText
      linkUrl
    }
  }
}
```

### GraphQL Playground

Visit `/api/graphql-playground` in your browser for an interactive query editor.

---

## TypeScript Types

Run `pnpm generate:types` in the backend to generate TypeScript interfaces. Import them in your frontend:

```ts
// Generated types from the backend
import type {
  ArtistProfile,
  Release,
  TourShow,
  BlogPost,
  PodcastEpisode,
  PodcastStat,
  MerchProduct,
  MediaGallery,
  Media,
  Subscription,
  ContactSubmission,
  Order,
  SiteSetting,
  Navigation,
  User,
} from '@/payload-types'

// API response types
interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

interface PayloadGlobalResponse<T> {
  id: number
  updatedAt: string
  createdAt: string
} & T
```

---

## Common Integration Patterns

### Fetch All Data for Homepage

```ts
const [artist, releases, shows, settings, nav] = await Promise.all([
  fetch('/api/artist-profile').then(r => r.json()),
  fetch('/api/releases?where[featured][equals]=true&depth=2').then(r => r.json()),
  fetch('/api/tour-shows?where[date][greater_than_equal]=2025-05-13&sort=date&limit=5').then(r => r.json()),
  fetch('/api/globals/site-settings').then(r => r.json()),
  fetch('/api/globals/navigation').then(r => r.json()),
])
```

### Newsletter Signup Form

```tsx
function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'Newsletter' }),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  // ... render form
}
```

### Contact Form

```tsx
async function submitContactForm(data: {
  name: string
  email: string
  message: string
  inquiryType?: string
}) {
  const res = await fetch('/api/contact-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
```

### Payment Flow

```ts
// 1. Create order (admin or via your order creation endpoint)
const order = await createOrder({
  customerEmail: 'fan@example.com',
  items: [{ type: 'EP', name: 'The Switch', price: 9.99, quantity: 1 }],
  total: 9.99,
})

// 2. Initialize Credo payment
const paymentRes = await fetch('/api/credo/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 999, // $9.99 in cents
    email: 'fan@example.com',
    currency: 'USD',
    reference: order.orderNumber,
    callbackUrl: `${window.location.origin}/payment/success`,
    narration: 'The Switch EP - MP3 Download',
  }),
})

const { data } = await paymentRes.json()

// 3. Redirect to Credo checkout
window.location.href = data.authorizationUrl

// 4. After redirect, verify at /api/credo/callback?transRef=xxx
```

---

## Error Responses

All endpoints return standard HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `500` | Server error |

**Error format:**

```json
{
  "errors": [
    {
      "message": "The following field is invalid: email",
      "field": "email"
    }
  ]
}
```
