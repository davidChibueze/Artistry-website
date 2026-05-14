# Payload CMS Build Prompt: Poshbugati Artist Website

You are building a Payload CMS v3.x backend for an artist website called "Poshbugati" (poshbugati.com). This is a single-artist website for an "Afro Country" music artist. The frontend is a Next.js 16.2.5 app with React 19.2.4, TypeScript strict mode, and CSS Modules.

All content is currently hardcoded in the frontend. Your job is to build the Payload CMS so all content can be managed via an admin back office.

---

## Project Context

- **Artist Name:** Poshbugati
- **Genre:** Afro Country
- **Debut EP:** "The Switch" (releasing May 22, 2025)
- **Podcast:** "Between Two Sounds" (episodes 7-12 currently)
- **Domain:** poshbugati.com
- **CDN (planned):** cdn.poshbugati.com
- **Frontend Framework:** Next.js 16.2.5, React 19.2.4, TypeScript strict
- **Styling:** CSS Modules with design tokens (dark brown/black background #0e0b09, gold accent oklch(72% 0.14 72), teal accent oklch(68% 0.14 195))
- **Fonts:** Playfair Display (serif) + Space Grotesk (sans-serif)

---

## Tech Stack

- **Payload CMS:** v3.x (latest)
- **Database:** PostgreSQL (neon)
- **Storage:** Local uploads (dev), S3/Cloudflare R2 (production)
- **Deployment:** Vercel (serverless) or separate VPS
- **Email (optional):** Resend or SendGrid for notifications
- **Payments (future):** Stripe

---

## Collections to Build

### 1. Users (Built-in, customize)
Payload's built-in Users collection. Add:
- `role` field (select: 'admin' | 'editor' | 'viewer')
- Access: Admin only

### 2. Artist Profile
Single-document collection for core artist info.

**Fields:**
- `name` (text, required) — e.g., "Poshbugati"
- `tagline` (text) — e.g., "Afro Country Artist"
- `bio` (richText) — Full biography
- `heroImage` (upload, relationship to Media)
- `portraitImage` (upload, relationship to Media)
- `principles` (array) — 3 core values
  - `icon` (text) — icon identifier string
  - `title` (text)
  - `description` (text)
- `timeline` (array) — career milestones
  - `year` (number)
  - `title` (text)
  - `description` (richText)
- `pressQuotes` (array) — quotes on about page
  - `quote` (text)
  - `author` (text)
  - `publication` (text)
- `socialLinks` (group)
  - `instagram` (text, URL validation)
  - `tiktok` (text, URL validation)
  - `youtube` (text, URL validation)
  - `soundcloud` (text, URL validation)
- `contactEmails` (group)
  - `general` (email)
  - `booking` (email)
  - `press` (email)

**Access:** Public read, admin write. Limit to 1 document.

### 3. Releases
Music releases (EPs, albums, singles).

**Fields:**
- `title` (text, required) — e.g., "The Switch"
- `slug` (text, unique, required, auto-generated from title)
- `type` (select: 'EP' | 'Album' | 'Single')
- `coverImage` (upload, relationship to Media, required)
- `releaseDate` (date)
- `description` (text)
- `featured` (checkbox) — show on homepage
- `tracks` (array)
  - `number` (number) — track number
  - `title` (text)
  - `subtitle` (text) — e.g., "feat. Artist Name"
  - `duration` (text) — e.g., "3:45"
  - `badge` (text, optional) — e.g., "Single"
  - `previewUrl` (text, URL) — 30-second preview MP3 URL
  - `audioFile` (upload, relationship to Media, optional) — full track
- `streamingLinks` (array)
  - `platform` (select: 'Spotify' | 'Apple Music' | 'YouTube Music' | 'Amazon Music' | 'Tidal' | 'Deezer' | 'SoundCloud')
  - `url` (text, URL)
- `distributionTiers` (array) — purchase options
  - `label` (text) — e.g., "MP3 Download", "WAV Download", "Complete Bundle"
  - `description` (text)
  - `price` (number)
  - `currency` (select, default: 'USD')

**Access:** Public read, admin write

### 4. Tour Shows
Tour dates (upcoming and past).

**Fields:**
- `venue` (text, required)
- `city` (text, required)
- `country` (text, optional)
- `date` (date, required)
- `time` (text, optional) — e.g., "8:00 PM"
- `type` (select: 'Headline' | 'Festival' | 'Support' | 'Private')
- `soldOut` (checkbox)
- `ticketUrl` (text, URL, optional)
- `notes` (text, optional)

**Access:** Public read, admin write

### 5. Blog Posts
Journal/blog entries.

**Fields:**
- `title` (text, required)
- `slug` (text, unique, required, auto-generated from title)
- `coverImage` (upload, relationship to Media)
- `category` (select: 'Tour' | 'Studio' | 'Personal' | 'News' | 'Behind The Scenes' | 'Other')
- `excerpt` (text) — short preview
- `content` (richText, required)
- `publishedDate` (date, required)
- `featured` (checkbox)
- `readTime` (number) — minutes, auto-calculated
- `published` (checkbox) — draft/published toggle

**Access:** Public read when published=true, admin write

### 6. Podcast Episodes
"Between Two Sounds" podcast episodes.

**Fields:**
- `episodeNumber` (number, required, unique)
- `title` (text, required)
- `description` (richText)
- `publishDate` (date)
- `duration` (text) — e.g., "45:30"
- `audioUrl` (text, URL)
- `guestName` (text, optional)
- `guestBio` (text, optional)
- `tags` (array of text)
- `featured` (checkbox)

**Access:** Public read, admin write

### 7. Podcast Stats
Single-document collection for podcast statistics.

**Fields:**
- `totalEpisodes` (number)
- `totalListeners` (number) — monthly listeners
- `averageRating` (number)
- `description` (text) — about the podcast

**Access:** Public read, admin write. Limit to 1 document.

### 8. Merch Products
Merchandise store items.

**Fields:**
- `name` (text, required)
- `slug` (text, unique, required, auto-generated from title)
- `images` (array of uploads, relationship to Media)
- `category` (select: 'Apparel' | 'Music' | 'Digital' | 'Bundle' | 'Accessory')
- `price` (number, required)
- `compareAtPrice` (number, optional) — original price if on sale
- `description` (richText)
- `variants` (array)
  - `name` (text) — e.g., "Size"
  - `options` (array of text) — e.g., ["S", "M", "L", "XL"]
- `inStock` (checkbox, default: true)
- `badge` (text, optional) — e.g., "New", "Limited Edition"
- `featured` (checkbox) — show in bundle hero

**Access:** Public read, admin write

### 9. Media Gallery
Press photos, videos, press quotes, EPK downloads.

**Fields:**
- `type` (select: 'Photo' | 'Video' | 'Press Quote' | 'EPK Download')
- `title` (text)
- `file` (upload, relationship to Media) — for photos and downloads
- `thumbnail` (upload, relationship to Media) — for video thumbnails
- `videoUrl` (text, URL) — YouTube/Vimeo embed URL
- `quote` (richText) — for press quotes
- `publication` (text) — for press quotes
- `author` (text) — for press quotes
- `fileSize` (text) — e.g., "2.4 MB"
- `fileType` (text) — e.g., "PDF", "ZIP"
- `order` (number) — for sorting

**Access:** Public read, admin write

### 10. Subscriptions
Fan club, newsletter, tour notification subscribers (read-only in admin).

**Fields:**
- `email` (email, required, unique)
- `firstName` (text)
- `lastName` (text)
- `type` (select: 'Fan Club' | 'Newsletter' | 'Tour Notifications')
- `subscribedAt` (date, default: now)
- `active` (checkbox, default: true)

**Access:** No public read. Public create-only (for forms). Admin read.

### 11. Contact Submissions
Contact form submissions (read-only in admin).

**Fields:**
- `name` (text, required)
- `email` (email, required)
- `organization` (text)
- `inquiryType` (select: 'Booking' | 'Press' | 'Collaboration' | 'Other')
- `eventDate` (date, optional)
- `budget` (text, optional)
- `message` (textarea, required)
- `submittedAt` (date, default: now)
- `status` (select: 'New' | 'Read' | 'Replied' | 'Archived', default: 'New')

**Access:** No public read. Public create-only. Admin full access.

### 12. Orders
Music/merch purchase orders.

**Fields:**
- `orderNumber` (text, unique, auto-generated, format: "PB-YYYY-NNNN")
- `customerEmail` (email, required)
- `customerName` (text)
- `items` (array)
  - `type` (select: 'Track' | 'EP' | 'Merch')
  - `name` (text)
  - `price` (number)
  - `quantity` (number, default: 1)
- `total` (number, required)
- `currency` (text, default: 'USD')
- `status` (select: 'Pending Payment' | 'Complete' | 'Refunded' | 'Expired', default: 'Pending Payment')
- `stripePaymentIntentId` (text)
- `downloadToken` (text)
- `downloadExpiresAt` (date)
- `downloadCount` (number, default: 0)
- `createdAt` (date, default: now)

**Access:** No public access. Admin full.

---

## Globals

### Site Settings
Single global for site-wide config.

**Fields:**
- `siteTitle` (text) — "Poshbugati"
- `siteDescription` (text) — SEO meta description
- `ogImage` (upload, relationship to Media)
- `announcementBar` (group)
  - `enabled` (checkbox)
  - `text` (text)
  - `linkText` (text)
  - `linkUrl` (text, URL)
  - `startDate` (date)
  - `endDate` (date)
- `epReleaseDate` (date) — "The Switch" release date (May 22, 2025)
- `cdnUrl` (text) — e.g., "cdn.poshbugati.com"
- `footerText` (text) — copyright text

### Navigation
Global for main nav links.

**Fields:**
- `navItems` (array)
  - `label` (text)
  - `url` (text)
  - `external` (checkbox)
  - `cta` (checkbox) — highlight as CTA button

---

## Media Collection Configuration

Use Payload's built-in Media collection with:

**Upload Settings:**
- Supported formats: JPG, PNG, GIF, SVG, MP3, WAV, PDF, ZIP
- Image sizes: thumbnail (400px), medium (800px), large (1600px)
- File size limits: Images 10MB, Audio 50MB, Documents 25MB

**Additional Fields:**
- `alt` (text) — alt text for accessibility
- `caption` (text)
- `category` (select: 'Release Cover' | 'Press Photo' | 'Merch' | 'Blog' | 'Artist' | 'Other')

---

## Access Control Matrix

| Collection | Public Read | Public Write | Admin | Editor | Viewer |
|------------|-------------|--------------|-------|--------|--------|
| Artist Profile | Yes | No | Full | Full | Read |
| Releases | Yes | No | Full | Full | Read |
| Tour Shows | Yes | No | Full | Full | Read |
| Blog Posts | Yes (published) | No | Full | Full | Read |
| Podcast Episodes | Yes | No | Full | Full | Read |
| Podcast Stats | Yes | No | Full | Full | Read |
| Merch Products | Yes | No | Full | Full | Read |
| Media Gallery | Yes | No | Full | Full | Read |
| Subscriptions | No | Create only | Read | Read | Read |
| Contact Submissions | No | Create only | Full | Full | Read |
| Orders | No | No | Full | Full | Read |
| Media (uploads) | Yes | No | Full | Full | Read |
| Users | No | No | Full | No | No |
| Site Settings (global) | Yes | No | Full | Full | Read |
| Navigation (global) | Yes | No | Full | Full | Read |

---

## Hooks Required

### 1. Auto-Slug Generation
For Releases, Blog Posts, Merch Products:
- Before validate or before change hook
- Generate slug from title (lowercase, hyphenated, remove special chars)
- Only auto-generate if slug is empty or title changed
- Allow manual override

### 2. Read Time Calculation
For Blog Posts:
- Before change hook
- Calculate from richText content length (~200 words per minute)
- Set readTime field automatically

### 3. Order Number Generation
For Orders:
- Before change hook (on create)
- Format: "PB-YYYY-NNNN" where NNNN is zero-padded sequential number
- Query existing orders to determine next number

### 4. Download Token Generation
For Orders:
- After change hook (when status changes to 'Complete')
- Generate random token (crypto.randomBytes)
- Set downloadExpiresAt to createdAt + 72 hours
- Reset downloadCount to 0

---

## Admin UI Customization

### Branding
- Custom logo in admin header (provide placeholder path)
- Custom favicon
- Use brand colors in CSS overrides:
  - Background: #0e0b09
  - Primary accent: oklch(72% 0.14 72) (gold)
  - Secondary accent: oklch(68% 0.14 195) (teal)

### Dashboard
Configure the admin dashboard with:
- Welcome message
- Quick links to key collections
- Widget showing upcoming tour shows (next 30 days)
- Widget showing recent contact submissions
- Widget showing recent orders

### Sidebar Organization
Group collections in admin sidebar:
- **Content:** Artist Profile, Blog Posts, Podcast Episodes, Podcast Stats
- **Music:** Releases, Media Gallery
- **Business:** Tour Shows, Merch Products, Orders
- **Engagement:** Subscriptions, Contact Submissions
- **Settings:** Site Settings, Navigation, Users

---

## API Endpoints (Auto-generated by Payload)

Payload REST API will be available at `/api`. Key endpoints:

```
GET    /api/artist-profile          — Artist info
GET    /api/releases                — All releases
GET    /api/releases?where[featured][equals]=true  — Featured releases
GET    /api/releases/:id            — Single release
GET    /api/tour-shows              — All shows
GET    /api/blog-posts              — All posts
GET    /api/blog-posts?where[published][equals]=true  — Published only
GET    /api/blog-posts/:id          — Single post
GET    /api/podcast-episodes        — All episodes
GET    /api/podcast-stats           — Stats
GET    /api/merch-products          — All products
GET    /api/media-gallery           — All media items
GET    /api/media                   — Uploads
GET    /api/globals/site-settings   — Site config
GET    /api/globals/navigation      — Nav links

POST   /api/subscriptions           — New subscriber
POST   /api/contact-submissions     — New contact form
POST   /api/orders                  — New order
```

All endpoints support Payload's standard query params: `where`, `sort`, `limit`, `page`, `depth`, `select`.

---

## Implementation Instructions

### Step 1: Initialize Payload Project
- Create a new Payload CMS v3.x project
- Use the blank template
- Configure with TypeScript
- Set up SQLite for development (easy to switch to PostgreSQL later)

### Step 2: Configure Database
- Set up SQLite adapter for dev
- Provide environment variable instructions for PostgreSQL in production
- Run initial migration

### Step 3: Create Collections
- Create each collection as a separate file in `src/collections/`
- Export all from `src/collections/index.ts`
- Follow the field specifications above exactly

### Step 4: Create Globals
- Create globals in `src/globals/`
- Export all from `src/globals/index.ts`

### Step 5: Configure Media
- Set up upload adapter (local for dev)
- Configure image sizes
- Add custom fields

### Step 6: Set Up Access Control
- Configure access control for each collection
- Implement role-based access for Users
- Set up public read access where specified

### Step 7: Implement Hooks
- Create hooks in `src/hooks/`
- Wire up auto-slug, read time, order number, and download token hooks

### Step 8: Customize Admin UI
- Add CSS overrides for branding
- Configure dashboard
- Organize sidebar navigation

### Step 9: Seed Data (Optional)
- Create a seed script with sample data matching the current hardcoded content
- Include at least: 1 artist profile, 1 release with 5 tracks, 3 blog posts, 3 podcast episodes, 5 tour shows, 3 merch products, 5 media items

### Step 10: Test
- Start the dev server
- Verify admin login works
- Verify all collections appear and are editable
- Test public API endpoints with curl or Postman
- Test form submission endpoints (subscriptions, contact)

---

## Key Details You May Need Help With

When building, you may encounter decisions that require input. Here are the answers to common questions:

### File Structure
```
payload-cms/
├── src/
│   ├── collections/
│   │   ├── ArtistProfile.ts
│   │   ├── Releases.ts
│   │   ├── TourShows.ts
│   │   ├── BlogPosts.ts
│   │   ├── PodcastEpisodes.ts
│   │   ├── PodcastStats.ts
│   │   ├── MerchProducts.ts
│   │   ├── MediaGallery.ts
│   │   ├── Subscriptions.ts
│   │   ├── ContactSubmissions.ts
│   │   ├── Orders.ts
│   │   └── index.ts
│   ├── globals/
│   │   ├── SiteSettings.ts
│   │   ├── Navigation.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── generateSlug.ts
│   │   ├── calculateReadTime.ts
│   │   ├── generateOrderNumber.ts
│   │   └── generateDownloadToken.ts
│   ├── access/
│   │   └── roles.ts
│   └── payload.config.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### Environment Variables
```
PAYLOAD_SECRET=<generate-with-crypto>
DATABASE_URL=file:./payload.db          # SQLite dev
# DATABASE_URL=postgresql://...         # PostgreSQL prod
UPLOAD_DIR=./media                      # Local uploads
# S3_BUCKET=...                         # Production storage
# S3_REGION=...
# S3_ACCESS_KEY_ID=...
# S3_SECRET_ACCESS_KEY=...
# RESEND_API_KEY=...                    # Email (optional)
# STRIPE_SECRET_KEY=...                 # Payments (future)
```

### Current Hardcoded Data to Eventually Migrate

**Release - "The Switch" (EP):**
- 5 tracks with preview URLs (currently using SoundHelix sample MP3s)
- Cover image (currently Unsplash placeholder)
- Release date: May 22, 2025

**Tour Shows:**
- 8 upcoming shows, 3 past shows
- Each has: date, venue, city, type, ticket URL (currently `#`)

**Blog Posts:**
- 6 posts + 1 featured post
- Categories: Tour, Studio, Personal, News
- Cover images (currently Unsplash)

**Podcast Episodes:**
- Episodes 7-12
- Each has: title, description, duration, date, tags

**Merch Products:**
- 6 products + 1 bundle
- Categories: Apparel, Music, Digital, Bundle
- Prices range from $5 to $120

**Media:**
- 7 press photos (Unsplash URLs)
- 4 videos (placeholder URLs)
- 6 press quotes
- 6 EPK downloads (placeholder links)

**Social Links:**
- Instagram, TikTok, YouTube, SoundCloud (currently all `#`)

---

## Output Requirements

Please provide:

1. **Complete `payload.config.ts`** with all collections, globals, and plugins configured
2. **All collection files** with full field definitions, access control, and hooks
3. **All global files** with full field definitions
4. **All hook files** with complete implementations
5. **Access control utilities** for role-based permissions
6. **`.env.example`** with all required environment variables
7. **`package.json`** with all dependencies
8. **Seed script** (optional but recommended) with sample data
9. **Setup instructions** — commands to install, run migrations, start dev server, and create first admin user
10. **API usage examples** — curl commands or fetch examples for key endpoints

Write production-quality TypeScript with proper types, error handling, and comments where the logic is non-obvious.
