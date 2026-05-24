# Poshbugati — Full-Stack Deployment Guide

Monorepo: `github.com/davidChibueze/Artistry-website`

```
Artistry-website/
├── artist-admin/   ← Payload CMS v3 (Next.js 16 / Node)  → Vercel
├── artistry/       ← Next.js 16 frontend                 → Vercel
└── deploy/         ← this guide
```

Both apps are deployed as **separate Vercel projects** from the same GitHub repo,
using Vercel's monorepo "root directory" setting to target each sub-folder.

---

## Architecture Overview

```
Browser
  │
  ├─► artistry (Next.js frontend)
  │     · Server components fetch data from artist-admin API
  │     · NEXT_PUBLIC_API_URL points to the admin's /api endpoint
  │     · Static assets (images) served from Supabase S3 storage
  │     · Payments via Credo (NGN) + PayPal (USD)
  │
  └─► artist-admin (Payload CMS)
        · REST API at /api — consumed by the frontend
        · Admin UI at /admin — content editors log in here
        · PostgreSQL database on Supabase
        · Media uploads stored in Supabase S3-compatible storage
        · Emails sent via Resend
        · Error tracking via Sentry
```

---

## Prerequisites

| Service | Purpose | URL |
|---|---|---|
| Vercel | Hosting both apps | vercel.com |
| Supabase | PostgreSQL DB + S3 file storage | supabase.com |
| Resend | Transactional email | resend.com |
| Credo | NGN payment gateway | credocentral.com |
| PayPal | USD payment gateway | developer.paypal.com |
| Sentry | Error tracking | sentry.io |
| GitHub | Source / Vercel CI | github.com |

---

## Part 1 — Backend: `artist-admin` (Payload CMS)

### 1.1 Tech Stack

- **Framework:** Next.js 16 (App Router) with Payload CMS v3.84
- **Database:** PostgreSQL via `@payloadcms/db-postgres` (Supabase)
- **File storage:** Supabase S3-compatible via `@payloadcms/storage-s3`
- **Auth:** Payload's built-in JWT sessions
- **Email:** Resend (`resend` package)
- **Payments:** Credo + PayPal webhook endpoints
- **Logging:** Pino + pino-http
- **Error tracking:** Sentry (`@sentry/nextjs`)

### 1.2 Collections & Globals

**Collections (database tables):**
`ArtistProfile` · `Releases` · `TourShows` · `BlogPosts` · `PodcastEpisodes` · `PodcastStats` · `MerchProducts` · `MediaGallery` · `Subscriptions` · `ContactSubmissions` · `Orders` · `Carts` · `EmailTemplates` · `EmailLogs` · `Media` · `Users`

**Globals (single-row config):**
`SiteSettings` · `Navigation`

### 1.3 Environment Variables

Set all of these in the Vercel project for `artist-admin`:

```env
# ── Core ──────────────────────────────────────────────
PAYLOAD_SECRET=           # openssl rand -base64 32
NEXT_PUBLIC_SERVER_URL=   # https://your-admin.vercel.app  (no trailing slash)
FRONTEND_URL=             # https://your-frontend.vercel.app  (used in CORS)

# ── Database (Supabase PostgreSQL) ────────────────────
DATABASE_URL=             # postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ── File Storage (Supabase S3) ────────────────────────
S3_BUCKET=                # your-supabase-project-id
S3_REGION=                # auto
S3_ENDPOINT=              # https://[project-id].supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=         # Supabase service role key
S3_SECRET_ACCESS_KEY=     # Supabase service role key

# ── Email ─────────────────────────────────────────────
RESEND_API_KEY=           # re_xxxxxxxxxxxx  (from resend.com)

# ── Payments ──────────────────────────────────────────
CREDO_PUBLIC_KEY=         # pk_live_xxxxx  (credocentral.com)
CREDO_SECRET_KEY=         # sk_live_xxxxx
CREDO_BASE_URL=           # https://api.credocentral.com

# ── Security ──────────────────────────────────────────
CRON_SECRET=              # openssl rand -base64 32  (protects cron job endpoint)
PREVIEW_SECRET=           # openssl rand -base64 32  (protects live preview)

# ── Observability ─────────────────────────────────────
SENTRY_DSN=               # https://xxx@oxx.ingest.sentry.io/xxx
SENTRY_ORG=               # your-sentry-org-slug
SENTRY_PROJECT=           # your-sentry-project-slug
LOG_LEVEL=                # info  (use debug only in staging)
```

### 1.4 Vercel Project Setup

1. Go to **vercel.com → Add New Project → Import Git Repository**
2. Select `Artistry-website`
3. Set **Root Directory** → `artist-admin`
4. **Framework Preset** → Next.js (auto-detected)
5. Paste all env vars from section 1.3
6. **Build Command** (leave default or use): `pnpm build`
7. **Output Directory**: `.next` (default)
8. Deploy

> **Node version:** Vercel must use Node ≥ 20.9.0. Set this in Project Settings → General → Node.js Version.

### 1.5 Database Migration

Payload's migration runner (`pnpm payload migrate`) can fail if the `payload_migrations` table doesn't track earlier applied migrations. The safe approach for this project is to apply SQL directly:

```bash
# Install node-postgres locally if needed
npm install -g pg

# Then run migrations directly against Supabase
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect();
// paste your migration SQL here
client.end();
"
```

After applying the SQL, record the migration in the tracking table:

```sql
INSERT INTO payload_migrations (name, batch)
VALUES ('20260520_100000_add_social_links_to_artist_profile', 1);
```

Migration files live in: `artist-admin/src/migrations/`

### 1.6 Creating the First Admin User

After the first deploy, visit `https://your-admin.vercel.app/admin` — Payload will prompt you to create an initial admin user on first load (only shown when no users exist).

### 1.7 CORS Configuration

The `payload.config.ts` reads `NEXT_PUBLIC_SERVER_URL` and `FRONTEND_URL` for the CORS allowlist. Both the admin URL and the frontend URL must be set correctly, otherwise the frontend will get blocked by CORS when making API calls.

---

## Part 2 — Frontend: `artistry` (Next.js)

### 2.1 Tech Stack

- **Framework:** Next.js 16.2 (App Router, Server Components)
- **Styling:** Plain CSS with CSS Modules (no Tailwind)
- **Icons:** Lucide React
- **Payments:** `@paypal/react-paypal-js`
- **Data fetching:** `fetch` with `cache: 'no-store'` for real-time data (artist profile, site settings), `next.revalidate` for slower-changing data (releases, tour dates)
- **Rich text:** Custom Lexical renderer (`src/app/_components/RichText.tsx`)

### 2.2 Environment Variables

Set these in the Vercel project for `artistry`:

```env
# ── API ───────────────────────────────────────────────
NEXT_PUBLIC_API_URL=      # https://your-admin.vercel.app/api  (no trailing slash, include /api)

# ── Site ──────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=     # https://your-frontend.vercel.app  (or custom domain)

# ── Payments ──────────────────────────────────────────
NEXT_PUBLIC_PAYPAL_CLIENT_ID=   # PayPal live client ID (developer.paypal.com)
```

### 2.3 Vercel Project Setup

1. Go to **vercel.com → Add New Project → Import Git Repository**
2. Select `Artistry-website` (same repo, different project)
3. Set **Root Directory** → `artistry`
4. **Framework Preset** → Next.js (auto-detected)
5. Paste all env vars from section 2.2
6. Deploy

### 2.4 URL Redirects

The following permanent redirects are already configured in `artistry/next.config.ts` — no action needed:

```
/merch        → /shop  (308)
/merch/:path* → /shop/:path*  (308)
```

### 2.5 Caching Behaviour

| Function | Cache | When to use |
|---|---|---|
| `getArtistProfile()` | `no-store` | Social links, bio — must be fresh |
| `getSiteSettings()` | `no-store` | Featured video, EP date — must be fresh |
| `getReleases()` | `revalidate: 300` | 5-minute cache |
| `getTourShows()` | `revalidate: 300` | 5-minute cache |
| `getBlogPosts()` | `revalidate: 60` | 1-minute cache |
| `getMediaGallery()` | `revalidate: 3600` | 1-hour cache |

A new Vercel deployment automatically busts the fetch cache.

---

## Part 3 — Infrastructure: Supabase

### 3.1 PostgreSQL

- Create a project at **supabase.com**
- Use the **connection pooler** URL (port 6543, not 5432) for serverless Vercel functions
- The schema is managed by Payload's migration system
- Connection string format:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```

### 3.2 S3-Compatible File Storage

1. In Supabase → **Storage** → create a bucket named after your project (e.g. `poshbugati-media`)
2. Set bucket to **Public** (so uploaded media URLs are publicly accessible)
3. Go to **Project Settings → API** → copy the service role key for `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`
4. S3 endpoint format:
   ```
   https://[project-id].supabase.co/storage/v1/s3
   ```

---

## Part 4 — Custom Domain (Optional)

### Frontend (artistry)
1. Vercel → `artistry` project → Settings → Domains → Add `poshbugati.com`
2. Add the DNS records Vercel provides (usually an A record + CNAME)
3. Update `NEXT_PUBLIC_SITE_URL` → `https://poshbugati.com`

### Admin (artist-admin)
1. Vercel → `artist-admin` project → Settings → Domains → Add `admin.poshbugati.com`
2. Update `NEXT_PUBLIC_SERVER_URL` → `https://admin.poshbugati.com`
3. Update `NEXT_PUBLIC_API_URL` in the **artistry** project → `https://admin.poshbugati.com/api`
4. Redeploy both projects after changing env vars

---

## Part 5 — Payments Configuration

### Credo (NGN)
1. Log in at **credocentral.com** → Settings → Developer → API Keys
2. Copy live keys into `CREDO_PUBLIC_KEY` and `CREDO_SECRET_KEY`
3. Set `CREDO_BASE_URL=https://api.credocentral.com`
4. Register the webhook URL in Credo dashboard:
   ```
   https://your-admin.vercel.app/api/credo/webhook
   ```

### PayPal (USD)
1. Log in at **developer.paypal.com** → Apps & Credentials → Live
2. Create an app → copy Client ID → paste into `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (artistry)
3. Register the webhook URL in PayPal:
   ```
   https://your-admin.vercel.app/api/paypal/webhook
   ```

---

## Part 6 — Email (Resend)

1. Sign up at **resend.com** → API Keys → Create Key
2. Add and verify your sending domain (e.g. `poshbugati.com`)
3. Paste the key into `RESEND_API_KEY` in the admin project
4. Email templates are managed in Payload Admin → Email Templates collection

---

## Part 7 — Deployment Checklist

### First-time deploy (in order)

- [ ] Supabase project created, DB connection string obtained
- [ ] Supabase storage bucket created and set to public
- [ ] `artist-admin` Vercel project created, root directory set to `artist-admin`
- [ ] All backend env vars set in Vercel
- [ ] `artist-admin` deployed successfully — visit `/admin` and create first user
- [ ] Payload migrations applied to production database
- [ ] `artistry` Vercel project created, root directory set to `artistry`
- [ ] `NEXT_PUBLIC_API_URL` set to the deployed admin URL + `/api`
- [ ] `artistry` deployed successfully — verify the homepage loads data
- [ ] CORS verified — no blocked requests in browser console
- [ ] Payment webhooks registered in Credo and PayPal dashboards
- [ ] Resend domain verified, email sending tested
- [ ] Custom domain added and DNS propagated (if applicable)
- [ ] Both projects redeployed after any domain/env var changes

### Subsequent deploys

Every `git push` to the `main` branch on GitHub triggers automatic redeployment of both Vercel projects. No manual steps required unless environment variables change.

### Env var changes

Changing any environment variable requires a **manual redeploy** of the affected project — Vercel does not automatically redeploy on env var changes:

```
Vercel Dashboard → Project → Deployments → Redeploy (latest)
```

---

## Part 8 — Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Frontend shows no data | Wrong `NEXT_PUBLIC_API_URL` | Check it includes `/api`, no trailing slash |
| Social links / video not showing | Stale fetch cache | Redeploy or wait for revalidation |
| Images not loading | Supabase bucket is private | Set bucket to public in Supabase storage |
| Admin UI blank on first visit | No users seeded | Visit `/admin` → Payload shows create-user form |
| `pnpm payload migrate` fails | `payload_migrations` out of sync | Apply SQL directly and insert row into `payload_migrations` |
| CORS errors in browser | `FRONTEND_URL` not set in admin | Add `FRONTEND_URL` env var and redeploy admin |
| Payments not processing | Wrong Credo/PayPal env or webhook URL | Verify keys and re-register webhooks |
| Emails not sending | Resend domain not verified | Verify DNS records in Resend dashboard |

---

## Quick Reference

```bash
# Generate a secure secret (run locally)
openssl rand -base64 32

# Regenerate Payload types after schema changes (run in artist-admin/)
pnpm generate:types

# Build admin locally to catch errors before pushing
cd artist-admin && pnpm build

# Build frontend locally
cd artistry && pnpm build

# Check TypeScript (frontend)
cd artistry && pnpm tsc --noEmit
```
