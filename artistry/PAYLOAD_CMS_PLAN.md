# Payload CMS Implementation Plan: Poshbugati Artist Website

## Overview

This plan outlines the Payload CMS setup needed to replace all hardcoded content on the Poshbugati website (poshbugati.com) with a fully manageable admin back office. The site is a single-artist website for "Poshbugati," an Afro Country music artist, featuring music, tour dates, blog, podcast, merch, media, and contact functionality.

---

## 1. Collections

### 1.1 Artist Profile
**Purpose:** Manage core artist information displayed across the site.

**Fields:**
- `name` (text, required) - Artist name
- `tagline` (text) - Short description (e.g., "Afro Country Artist")
- `bio` (richText) - Full biography for /about page
- `heroImage` (upload, relationship to Media) - Main hero image
- `portraitImage` (upload, relationship to Media) - Portrait for about page
- `principles` (array) - Three core principles
  - `icon` (text) - Icon identifier
  - `title` (text)
  - `description` (text)
- `timeline` (array) - Career milestones
  - `year` (number)
  - `title` (text)
  - `description` (richText)
- `pressQuotes` (array) - Press quotes on about page
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

**Access:** Public read, admin write

---

### 1.2 Releases (Music)
**Purpose:** Manage EP/album/single releases displayed on home and music pages.

**Fields:**
- `title` (text, required) - Release name (e.g., "The Switch")
- `slug` (text, unique, required) - URL-friendly identifier
- `type` (select: 'EP' | 'Album' | 'Single')
- `coverImage` (upload, relationship to Media, required)
- `releaseDate` (date)
- `description` (text)
- `featured` (checkbox) - Show on homepage
- `tracks` (array)
  - `number` (number)
  - `title` (text)
  - `subtitle` (text) - e.g., "feat. Artist"
  - `duration` (text) - e.g., "3:45"
  - `badge` (text, optional) - e.g., "Single"
  - `previewUrl` (text, URL) - 30-second preview MP3 URL
  - `audioFile` (upload, relationship to Media) - Full track file (optional)
- `streamingLinks` (array)
  - `platform` (select: 'Spotify' | 'Apple Music' | 'YouTube Music' | 'Amazon Music' | 'Tidal' | 'Deezer' | 'SoundCloud')
  - `url` (text, URL)
- `distributionTiers` (array) - Purchase options
  - `label` (text) - e.g., "MP3 Download"
  - `description` (text)
  - `price` (number)
  - `currency` (select, default: 'USD')

**Access:** Public read, admin write

---

### 1.3 Tour Shows
**Purpose:** Manage upcoming and past tour dates.

**Fields:**
- `venue` (text, required)
- `city` (text, required)
- `country` (text, optional)
- `date` (date, required)
- `time` (text, optional) - e.g., "8:00 PM"
- `type` (select: 'Headline' | 'Festival' | 'Support' | 'Private')
- `soldOut` (checkbox)
- `ticketUrl` (text, URL, optional)
- `notes` (text, optional) - Additional info

**Access:** Public read, admin write

---

### 1.4 Blog Posts
**Purpose:** Manage journal/blog entries.

**Fields:**
- `title` (text, required)
- `slug` (text, unique, required)
- `coverImage` (upload, relationship to Media)
- `category` (select: 'Tour' | 'Studio' | 'Personal' | 'News' | 'Behind The Scenes' | 'Other')
- `excerpt` (text) - Short preview text
- `content` (richText, required) - Full blog post
- `publishedDate` (date, required)
- `featured` (checkbox) - Show as featured post
- `readTime` (number) - Estimated reading time in minutes
- `published` (checkbox) - Draft/published status

**Access:** Public read (when published), admin write

---

### 1.5 Podcast Episodes
**Purpose:** Manage "Between Two Sounds" podcast episodes.

**Fields:**
- `episodeNumber` (number, required, unique)
- `title` (text, required)
- `description` (richText)
- `publishDate` (date)
- `duration` (text) - e.g., "45:30"
- `audioUrl` (text, URL) - Full episode audio
- `guestName` (text, optional)
- `guestBio` (text, optional)
- `tags` (array of text)
- `featured` (checkbox)

**Access:** Public read, admin write

---

### 1.6 Podcast Stats
**Purpose:** Manage podcast statistics displayed on the podcast page.

**Fields:**
- `totalEpisodes` (number)
- `totalListeners` (number) - or "Monthly Listeners"
- `averageRating` (number)
- `description` (text) - About the podcast

**Access:** Public read, admin write
**Note:** Single document collection (limit to 1)

---

### 1.7 Merch Products
**Purpose:** Manage merchandise store items.

**Fields:**
- `name` (text, required)
- `slug` (text, unique, required)
- `images` (array of uploads, relationship to Media)
- `category` (select: 'Apparel' | 'Music' | 'Digital' | 'Bundle' | 'Accessory')
- `price` (number, required)
- `compareAtPrice` (number, optional) - Original price if on sale
- `description` (richText)
- `variants` (array)
  - `name` (text) - e.g., "Size", "Color"
  - `options` (array of text) - e.g., ["S", "M", "L", "XL"]
- `inStock` (checkbox, default: true)
- `badge` (text, optional) - e.g., "New", "Limited Edition"
- `featured` (checkbox) - Show in bundle hero section

**Access:** Public read, admin write

---

### 1.8 Media Gallery
**Purpose:** Manage press photos, videos, and EPK downloads.

**Fields:**
- `type` (select: 'Photo' | 'Video' | 'Press Quote' | 'EPK Download')
- `title` (text)
- `file` (upload, relationship to Media) - For photos and downloads
- `thumbnail` (upload, relationship to Media) - For videos
- `videoUrl` (text, URL) - YouTube/Vimeo embed URL (for videos)
- `quote` (richText) - For press quotes
- `publication` (text) - For press quotes
- `author` (text) - For press quotes
- `fileSize` (text) - For EPK downloads, e.g., "2.4 MB"
- `fileType` (text) - For EPK downloads, e.g., "PDF", "ZIP"
- `order` (number) - For sorting

**Access:** Public read, admin write

---

### 1.9 Subscriptions
**Purpose:** Store fan club and newsletter subscribers (read-only in admin).

**Fields:**
- `email` (email, required, unique)
- `firstName` (text)
- `lastName` (text)
- `type` (select: 'Fan Club' | 'Newsletter' | 'Tour Notifications')
- `subscribedAt` (date, default: now)
- `active` (checkbox, default: true)

**Access:** Admin read-only (no public access)

---

### 1.10 Contact Submissions
**Purpose:** Store contact form submissions (read-only in admin).

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

**Access:** Admin read-only (no public access)

---

### 1.11 Orders
**Purpose:** Track music/merch purchase orders.

**Fields:**
- `orderNumber` (text, unique, auto-generated)
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

**Access:** Admin read/write (no public access)

---

## 2. Globals

### 2.1 Site Settings
**Purpose:** Global site configuration.

**Fields:**
- `siteTitle` (text) - "Poshbugati"
- `siteDescription` (text) - SEO meta description
- `ogImage` (upload, relationship to Media) - Default OpenGraph image
- `announcementBar` (group)
  - `enabled` (checkbox)
  - `text` (text)
  - `linkText` (text)
  - `linkUrl` (text, URL)
  - `startDate` (date)
  - `endDate` (date)
- `epReleaseDate` (date) - "The Switch" release date for countdowns
- `cdnUrl` (text) - CDN base URL (e.g., "cdn.poshbugati.com")
- `footerText` (text) - Copyright text

---

### 2.2 Navigation
**Purpose:** Manage main navigation links.

**Fields:**
- `navItems` (array)
  - `label` (text)
  - `url` (text)
  - `external` (checkbox)
  - `cta` (checkbox) - Highlight as CTA button

---

## 3. Media Configuration

### 3.1 Media Collection
Payload's built-in Media collection should be configured with:

**Upload Settings:**
- Supported formats: JPG, PNG, GIF, SVG, MP3, WAV, PDF, ZIP
- Image sizes: thumbnail (400px), medium (800px), large (1600px)
- File size limits: Images 10MB, Audio 50MB, Documents 25MB

**Fields:**
- `alt` (text) - Alt text for accessibility
- `caption` (text)
- `category` (select: 'Release Cover' | 'Press Photo' | 'Merch' | 'Blog' | 'Artist' | 'Other')

---

## 4. Access Control

### 4.1 User Roles
Configure Payload's built-in Users collection with roles:

- **Admin** - Full access to all collections and settings
- **Editor** - Can manage all content collections, cannot manage users or site settings
- **Viewer** - Read-only access to all collections

### 4.2 Access Rules
| Collection | Public Read | Public Write | Admin Access |
|------------|-------------|--------------|--------------|
| Artist Profile | Yes | No | Full |
| Releases | Yes | No | Full |
| Tour Shows | Yes | No | Full |
| Blog Posts | Yes (published only) | No | Full |
| Podcast Episodes | Yes | No | Full |
| Podcast Stats | Yes | No | Full |
| Merch Products | Yes | No | Full |
| Media Gallery | Yes | No | Full |
| Subscriptions | No | Yes (create only) | Read |
| Contact Submissions | No | Yes (create only) | Full |
| Orders | No | No | Full |
| Media (uploads) | Yes | No | Full |
| Users | No | No | Admin only |

---

## 5. Admin UI Customization

### 5.1 Branding
- Custom logo in admin header
- Custom favicon
- Brand colors matching site design:
  - Background: #0e0b09
  - Primary: gold (oklch(72% 0.14 72))
  - Accent: teal (oklch(68% 0.14 195))

### 5.2 Dashboard
Configure admin dashboard with quick-access widgets:
- Recent blog posts
- Upcoming tour shows (next 30 days)
- Recent contact submissions
- Recent orders
- Subscriber count

### 5.3 Collection Organization
Group collections in admin sidebar:
- **Content:** Artist Profile, Blog Posts, Podcast Episodes, Podcast Stats
- **Music:** Releases, Media Gallery
- **Business:** Tour Shows, Merch Products, Orders
- **Engagement:** Subscriptions, Contact Submissions
- **Settings:** Site Settings, Navigation, Users

---

## 6. Hooks & Automation

### 6.1 Auto-Slug Generation
- Generate slugs automatically from title for Releases, Blog Posts, Merch Products
- Allow manual override

### 6.2 Read Time Calculation
- Auto-calculate blog post read time from content length on save

### 6.3 Order Number Generation
- Auto-generate unique order numbers (e.g., "PB-2025-0001")

### 6.4 Download Token Generation
- Generate signed tokens for order downloads with 72-hour expiry

### 6.5 Email Notifications (via Payload hooks or webhooks)
- New contact submission -> notify booking/press email
- New subscription -> confirmation email (optional)
- New order -> confirmation email with download link

---

## 7. API & Integration

### 7.1 REST API
Payload provides REST API out of the box. Endpoints will replace the planned API in CMS_ENDPOINTS.md:

| Payload Collection | REST Endpoint |
|-------------------|---------------|
| Artist Profile | `GET /api/artist-profile` |
| Releases | `GET /api/releases`, `GET /api/releases/:id` |
| Tour Shows | `GET /api/tour-shows` |
| Blog Posts | `GET /api/blog-posts`, `GET /api/blog-posts/:id` |
| Podcast Episodes | `GET /api/podcast-episodes` |
| Merch Products | `GET /api/merch-products`, `GET /api/merch-products/:id` |
| Media Gallery | `GET /api/media-gallery` |
| Media (uploads) | `GET /api/media`, `GET /api/media/:id` |
| Site Settings | `GET /api/globals/site-settings` |
| Navigation | `GET /api/globals/navigation` |

### 7.2 Next.js Integration
- Use `fetch()` with Payload REST API in Server Components
- Implement revalidation with `revalidateTag()` for ISR
- Create shared TypeScript types from Payload schema

### 7.3 Stripe Integration (Future)
- Webhook endpoint for payment confirmation
- Update order status on successful payment
- Trigger download token generation

---

## 8. Implementation Steps

### Phase 1: Setup (Day 1-2)
1. Initialize Payload CMS project alongside Next.js frontend
2. Configure database (PostgreSQL recommended)
3. Configure Media collection with upload settings
4. Set up admin branding and dashboard
5. Create Users collection with roles

### Phase 2: Content Collections (Day 3-5)
1. Create Artist Profile collection
2. Create Releases collection with tracks
3. Create Tour Shows collection
4. Create Blog Posts collection
5. Create Podcast Episodes + Stats collections
6. Create Merch Products collection
7. Create Media Gallery collection

### Phase 3: Globals & Settings (Day 6)
1. Create Site Settings global
2. Create Navigation global
3. Configure access control and roles

### Phase 4: Hooks & Automation (Day 7)
1. Implement auto-slug generation
2. Implement read time calculation
3. Implement order number generation
4. Configure email notifications (optional)

### Phase 5: Frontend Integration (Day 8-10)
1. Create API client/utility functions in Next.js
2. Generate TypeScript types from Payload schema
3. Replace hardcoded content in each page:
   - Home page
   - About page
   - Music page
   - Tour page
   - Podcast page
   - Blog page
   - Merch page
   - Media page
   - Contact page
4. Implement ISR with revalidation
5. Test all pages with CMS data

### Phase 6: Forms & Submissions (Day 11-12)
1. Connect subscribe forms to Subscriptions collection
2. Connect contact form to Contact Submissions collection
3. Connect tour notification signup
4. Connect newsletter signup

### Phase 7: Testing & Launch (Day 13-14)
1. Content migration (populate CMS with existing hardcoded data)
2. Test all admin workflows
3. Test all frontend pages
4. Test form submissions
5. Performance testing
6. Deploy to production

---

## 9. Technology Stack Recommendations

| Component | Recommendation |
|-----------|----------------|
| Payload CMS | v3.x (latest) |
| Database | PostgreSQL (production), SQLite (development) |
| Storage | Local (dev), S3/Cloudflare R2 (production) |
| Deployment | Vercel (frontend + Payload serverless) or separate VPS |
| Email | Resend or SendGrid for notifications |
| Payments | Stripe (future integration) |

---

## 10. Content Migration Checklist

Migrate all existing hardcoded content to Payload CMS:

- [ ] Artist bio, principles, timeline, press quotes
- [ ] All 5 tracks from "The Switch" EP
- [ ] All release data (covers, descriptions, streaming links)
- [ ] All 6 blog posts + 1 featured post
- [ ] All 6 podcast episodes (7-12)
- [ ] All 8 upcoming + 3 past tour shows
- [ ] All 6 merch products + 1 bundle
- [ ] All 7 press photos
- [ ] All 4 videos
- [ ] All 6 press quotes (media page)
- [ ] All 6 EPK downloads
- [ ] Social links (update from `#` to real URLs)
- [ ] Ticket URLs (update from `#` to real URLs)
- [ ] Video URLs (update from `#` to real URLs)
- [ ] EPK download links (update from `#` to real URLs)
- [ ] Contact emails
- [ ] Distribution tiers and pricing
- [ ] Streaming platform links

---

## 11. Future Enhancements

- [ ] Analytics dashboard in admin
- [ ] SEO meta management per page
- [ ] Redirect management
- [ ] A/B testing for announcement bar
- [ ] Merch inventory tracking
- [ ] Stripe payment integration
- [ ] Email marketing integration (Mailchimp, ConvertKit)
- [ ] Multi-language support
- [ ] Scheduled content publishing
- [ ] Content versioning/revisions
