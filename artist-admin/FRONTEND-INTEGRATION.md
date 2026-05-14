# Frontend Integration Prompt: Poshbugati Website

You are building the frontend for **Poshbugati** (poshbugati.com), an Afro Country artist website. The backend is a Payload CMS v3.x instance. Your job is to replace all hardcoded data in the existing frontend with CMS-managed content.

---

## Context

- **Backend:** Payload CMS v3.x running on PostgreSQL
- **Frontend:** Next.js 16.2.5, React 19.2.4, TypeScript strict mode
- **Styling:** CSS Modules with design tokens (dark brown/black `#0e0b09`, gold accent `oklch(72% 0.14 72)`, teal accent `oklch(68% 0.14 195)`)
- **Fonts:** Playfair Display (serif) + Space Grotesk (sans-serif)
- **API Base URL:** `http://localhost:3000/api` (dev), `https://poshbugati.com/api` (prod)

---

## Source of Truth

All API endpoints, response schemas, query parameters, and integration examples are documented in **`API.md`** in the project root. Use it as your single reference for:

- Every collection endpoint and its response shape
- Global endpoints (site settings, navigation)
- Public write endpoints (subscriptions, contact form)
- Payment flow (Credo initialize, callback, webhook)
- Email broadcast endpoint
- Query parameters, where operators, filtering
- GraphQL schema and playground
- TypeScript type imports
- Common integration patterns

**Do not guess endpoint URLs or response shapes. Always refer to `API.md`.**

---

## Existing Frontend Structure

The frontend already exists with hardcoded data. Your job is to wire it up to the CMS. Here's what's already built:

### Routes

| Route | File | Current State |
|---|---|---|
| `/` | `src/app/(main)/page.tsx` | Hardcoded hero, releases, tour, blog, subscribe |
| `/about` | `src/app/(main)/about/page.tsx` | Hardcoded bio, timeline, press quotes |
| `/music` | `src/app/(main)/music/page.tsx` | Hardcoded EP tracks, MusicPlayer component |
| `/tour` | `src/app/(main)/tour/page.tsx` | Hardcoded tour shows |
| `/blog` | `src/app/(main)/blog/page.tsx` | Hardcoded blog posts |
| `/podcast` | `src/app/(main)/podcast/page.tsx` | Hardcoded podcast episodes |
| `/merch` | `src/app/(main)/merch/page.tsx` | Hardcoded merch products |
| `/media` | `src/app/(main)/media/page.tsx` | Hardcoded press photos, videos, quotes |
| `/contact` | `src/app/(main)/contact/page.tsx` | Hardcoded contact info + form |
| `/subscribe` | `src/app/subscribe/page.tsx` | Fan club signup with countdown timer |

### Existing Components (in `src/app/_components/`)

| Component | Purpose | Needs CMS Integration |
|---|---|---|
| `Nav.tsx` | Header navigation | Nav items from `/api/globals/navigation` |
| `Footer.tsx` | Footer with social links | Social links from artist profile, copyright from site settings |
| `AnnounceBar.tsx` | Top announcement bar | From site settings `announcementBar` |
| `MusicPlayer.tsx` | Track list with 30s audio previews, play/pause/progress | Tracks from release data, streaming links from release |
| `AudioPreviewBar.tsx` | Fixed bottom bar for active preview | Already handles `Track` interface — adapt to CMS track data |
| `DistributionModal.tsx` | Multi-stage purchase: options → payment → success | Tiers from release `distributionTiers`, streaming links from release `streamingLinks`, integrate Credo payment |
| `HomeSubscribeForm.tsx` | Simple email signup on homepage | POST to `/api/subscriptions` |
| `SubscribePageClient.tsx` | Full fan club signup with countdown timer | Countdown target from site settings `epReleaseDate`, POST to `/api/subscriptions` |
| `ContactForm.tsx` | Contact form with inquiry types | POST to `/api/contact-submissions`, contact emails from artist profile |
| `BlogContent.tsx` | Blog post rendering | Content from blog posts |
| `TourContent.tsx` | Tour show listing | From `/api/tour-shows` |
| `MerchContent.tsx` | Product listing | From `/api/merch-products` |
| `MediaContent.tsx` | Press media grid | From `/api/media-gallery` |
| `Tracklist.tsx` | Track listing component | From release tracks |

### Existing Component Interfaces

**Track interface** (from `MusicPlayer.tsx`):
```ts
export interface Track {
  n: number;           // track number
  name: string;        // track title
  sub: string;         // subtitle (e.g. "feat. Artist")
  dur: string;         // duration (e.g. "3:45")
  badge: string;       // badge text (e.g. "Lead Single")
  previewUrl: string;  // 30-second preview MP3 URL
}
```

**DistributionModal** has 3 stages: `'options' | 'payment' | 'success'`
- Options: shows streaming platforms + download tiers (single track or full EP)
- Payment: email + card form (replace with Credo redirect)
- Success: confirmation with download link

**SubscribePageClient** has a countdown to `new Date('2025-05-22')` — this should come from site settings `epReleaseDate`.

---

## What to Build

### 1. API Client Layer

Create a typed API client that wraps all fetch calls.

**File:** `src/lib/api.ts`

```ts
// Example structure — adapt to match API.md exactly
export async function getArtistProfile() { ... }
export async function getReleases(filters?: { featured?: boolean; type?: string }) { ... }
export async function getTourShows(filters?: { upcoming?: boolean; type?: string }) { ... }
export async function getBlogPosts(filters?: { published?: boolean; category?: string; featured?: boolean }) { ... }
export async function getBlogPostBySlug(slug: string) { ... }
export async function getPodcastEpisodes(filters?: { featured?: boolean }) { ... }
export async function getPodcastStats() { ... }
export async function getMerchProducts(filters?: { inStock?: boolean; category?: string; featured?: boolean }) { ... }
export async function getMerchProductBySlug(slug: string) { ... }
export async function getMediaGallery(filters?: { type?: string }) { ... }
export async function getMedia(filters?: { category?: string }) { ... }
export async function getSiteSettings() { ... }
export async function getNavigation() { ... }
```

All functions should return typed data using the generated Payload types from `src/payload-types.ts` (in the CMS project). Copy or symlink the types file into the frontend at `src/payload-types.ts`.

---

### 2. Pages to Update (replace hardcoded data with CMS data)

| Route | Data Source | API.md Section |
|---|---|---|
| `/` | Hero (artist profile), featured releases, upcoming shows, featured blog post, subscribe form | Artist Profile, Releases, Tour Shows, Blog Posts |
| `/about` | Full artist bio, timeline, press quotes, principles, portrait image | Artist Profile |
| `/music` | Release with tracks, streaming links, distribution tiers, MusicPlayer | Releases (single) |
| `/tour` | All tour shows (upcoming + past) | Tour Shows |
| `/blog` | Blog post listing with category filters, pagination | Blog Posts |
| `/podcast` | Podcast episodes, stats | Podcast Episodes, Podcast Stats |
| `/merch` | Product listing with category filters | Merch Products |
| `/media` | Press photos, videos, press quotes, EPK downloads | Media Gallery |
| `/contact` | Contact form, contact emails from artist profile | Contact Submissions (POST), Artist Profile |
| `/subscribe` | Fan club signup, countdown to EP release | Subscriptions (POST), Site Settings (`epReleaseDate`) |

**Note:** The existing site does NOT have dynamic `[slug]` routes for blog posts, releases, merch products, or podcast episodes. These are single-page listings. If you add detail pages, use `generateStaticParams`.

---

### 3. Components to Wire Up

#### Layout Components
- **Nav** — populated from `/api/globals/navigation` (items have `label`, `url`, `external`, `cta`)
- **Footer** — copyright from `/api/globals/site-settings` `footerText`, social links from artist profile `socialLinks`
- **AnnounceBar** — from site settings `announcementBar` group; respect `enabled`, `startDate`, `endDate`

#### Music / Payment Components
- **MusicPlayer** — replace hardcoded tracks with release `tracks` array from CMS. Map CMS fields to the existing `Track` interface:
  - `tracks[].number` → `n`
  - `tracks[].title` → `name`
  - `tracks[].subtitle` → `sub`
  - `tracks[].duration` → `dur`
  - `tracks[].badge` → `badge`
  - `tracks[].previewUrl` → `previewUrl`
- **AudioPreviewBar** — no changes needed, already accepts `Track` interface
- **DistributionModal** — replace hardcoded tiers with release `distributionTiers` from CMS. Replace hardcoded streaming platforms with release `streamingLinks`. **Replace the fake payment form with Credo redirect flow** (see Payment Flow section below).

#### Form Components
- **HomeSubscribeForm** — replace the mock `handleSubmit` with `POST /api/subscriptions`:
  ```ts
  const res = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type: 'Newsletter' }),
  })
  ```
- **SubscribePageClient** — replace countdown target with site settings `epReleaseDate`. Replace mock submit with `POST /api/subscriptions` (type: `'Fan Club'`).
- **ContactForm** — replace mock submit with `POST /api/contact-submissions`. Map form fields:
  - `form.name` → `name`
  - `form.email` → `email`
  - `form.org` → `organization`
  - `form.type` → `inquiryType` (map: `'booking'` → `'Booking'`, `'press'` → `'Press'`, `'sync'` → `'Other'`, `'collab'` → `'Collaboration'`)
  - `form.date` → `eventDate`
  - `form.budget` → `budget`
  - `form.msg` → `message`
  - Also populate direct contact emails from artist profile `contactEmails`

#### Content Components
- **BlogContent** — render `content` field (Lexical JSON) from blog posts
- **TourContent** — populate from `/api/tour-shows`
- **MerchContent** — populate from `/api/merch-products`
- **MediaContent** — populate from `/api/media-gallery`, filter by `type`

---

### 4. Data Fetching Strategy

- Use **Server Components** for initial page data (no client-side waterfalls)
- Use **`fetch` with `next.revalidate`** for ISR (Incremental Static Regeneration)
- Set appropriate revalidation times per content type:
  - Artist profile, site settings, navigation: `revalidate: 3600` (1 hour)
  - Releases, tour shows: `revalidate: 300` (5 minutes)
  - Blog posts, podcast episodes: `revalidate: 60` (1 minute)
  - Merch products: `revalidate: 300` (5 minutes)
- Use **client components** only for interactive elements (forms, audio players, filters, countdown)

---

### 5. Environment Variables

Add to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Production:

```
NEXT_PUBLIC_API_URL=https://poshbugati.com/api
NEXT_PUBLIC_SITE_URL=https://poshbugati.com
```

---

### 6. TypeScript Setup

Copy the generated types from the CMS project (`artist-admin/src/payload-types.ts`) into the frontend at `src/payload-types.ts`. Re-run `pnpm generate:types` in the CMS project after any schema changes.

Define API response wrapper types:

```ts
interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
}

interface PayloadGlobalResponse<T> {
  id: number
  updatedAt: string
  createdAt: string
} & T
```

---

### 7. Key Integration Details from API.md

Refer to `API.md` for these specifics:

- **Query parameters:** `where`, `sort`, `limit`, `page`, `depth`, `select` — see the Query Parameters table
- **Where operators:** `equals`, `not_equals`, `contains`, `like`, `in`, `greater_than`, `less_than`, `between`, `exists` — see the Where Operators table
- **AND/OR logic:** `?where[or][0][type][equals]=...` syntax
- **Rich text rendering:** Blog post `content` is Lexical JSON. For Payload v3.x with `@payloadcms/richtext-lexical`, render with:
  ```tsx
  import { RichText } from '@payloadcms/richtext-lexical/react'
  <RichText data={post.content} />
  ```
  If that import doesn't work in your version, check the Payload docs at `https://payloadcms.com/docs/richtext/lexical` for the correct component. Alternatively, convert Lexical JSON to HTML on the backend with a custom endpoint.
- **Media sizes:** Images have `sizes.thumbnail`, `sizes.medium`, `sizes.large` with separate URLs
- **Subscription form:** POST to `/api/subscriptions` with `email`, `firstName`, `type` — triggers welcome email automatically
- **Contact form:** POST to `/api/contact-submissions` with `name`, `email`, `message` (required) + optional fields

---

### 8. Payment Integration (Credo)

The payment flow uses Credo. See the "Payments (Credo)" section in `API.md` for the full flow.

**Important: Orders are created server-side, NOT by the frontend.**

The flow is:

1. User clicks "Get Track" or "Buy Full EP" in DistributionModal
2. Frontend calls `POST /api/credo/initialize` with:
   - `amount` (in lowest unit: ₦150.00 = `15000`, $9.99 = `999`)
   - `email` (customer email)
   - `currency` (`NGN` or `USD`)
   - `reference` (generate a unique reference like `PB-${Date.now()}`)
   - `callbackUrl` (e.g., `${NEXT_PUBLIC_SITE_URL}/payment/success`)
   - `narration` (e.g., "The Switch EP — MP3 Download")
3. Response includes `data.authorizationUrl` — redirect the user there
4. User completes payment on Credo's hosted checkout
5. Credo redirects to `callbackUrl` with `?transRef=xxx`
6. Frontend calls `GET /api/credo/callback?transRef=xxx` to verify
7. On success, show confirmation with download token
8. **Server-side:** The Credo webhook (`POST /api/credo/webhook`) automatically creates/updates the order in the CMS and marks it as `Complete`. The callback endpoint also verifies and updates the order.

**You do NOT need to create orders manually.** The CMS handles order creation via the webhook and callback endpoints. The frontend only needs to:
1. Initialize the payment
2. Redirect to Credo
3. Handle the callback response

**DistributionModal changes:**
- Replace the fake card form (stage `'payment'`) with a "Proceed to Checkout" button that calls `POST /api/credo/initialize` and redirects to `authorizationUrl`
- Keep the `'options'` stage but populate tiers from CMS `distributionTiers`
- Keep the `'success'` stage but show the download token from the callback response

---

### 9. SEO & Metadata

- Use site settings `siteTitle`, `siteDescription`, `ogImage` for default metadata
- Each page should set its own `<title>` and `<meta>` tags
- Blog posts and releases should have Open Graph tags with their cover images
- The existing `src/app/sitemap.ts` and `src/app/robots.ts` should be updated to include all CMS content

---

### 10. Error Handling

- Show user-friendly error messages for API failures
- Handle `404` for missing content
- Handle `500` with a fallback UI
- Form submissions should show loading states and validation errors
- Payment failures should redirect to a failure page with retry option

---

## Deliverables

1. **`src/lib/api.ts`** — Typed API client with functions for every endpoint
2. **`src/payload-types.ts`** — Copied from CMS project (or symlinked)
3. **Updated page components** — replace hardcoded data with CMS fetches
4. **Wired-up existing components** — Nav, Footer, AnnounceBar, MusicPlayer, DistributionModal, HomeSubscribeForm, SubscribePageClient, ContactForm, BlogContent, TourContent, MerchContent, MediaContent
5. **Payment flow** — DistributionModal → Credo initialize → redirect → callback → success
6. **SEO metadata** on all pages
7. **Error boundaries** and loading states

---

## Workflow

1. Read `API.md` thoroughly before writing any code
2. Copy `payload-types.ts` from the CMS project into the frontend
3. Start with the API client layer (`src/lib/api.ts`) — this is the foundation
4. Build layout components (Nav, Footer, AnnounceBar) that depend on globals
5. Update the homepage — it pulls from multiple collections
6. Update individual pages one at a time (about, music, tour, blog, podcast, merch, media, contact, subscribe)
7. Wire up forms (HomeSubscribeForm, SubscribePageClient, ContactForm)
8. Update MusicPlayer to use CMS track data
9. Update DistributionModal to use CMS tiers + integrate Credo payment flow
10. Test all routes against the running backend
11. Add error handling and loading states
