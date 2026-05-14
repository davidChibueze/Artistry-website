# Poshbugati Payload CMS - Setup Instructions

## Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- PostgreSQL database (Neon recommended for production)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and configure environment variables
cp .env.example .env

# 3. Run database migrations
pnpm payload migrate

# 4. Start the dev server
pnpm dev

5. Open admin panel
# http://localhost:3000/admin
```

## Environment Variables

### Required

#### `PAYLOAD_SECRET`

Used to encrypt JWT tokens for authentication.

**Generate:**
```bash
openssl rand -base64 32
```

**Example:** `PAYLOAD_SECRET=abc123def456...`

---

#### `DATABASE_URL`

PostgreSQL connection string. The project uses `@payloadcms/db-postgres`.

**Option A: Neon (Recommended for Production)**

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Go to **Dashboard > Connection Details**
4. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
5. Paste it as your `DATABASE_URL`

**Option B: Local PostgreSQL**

1. Install PostgreSQL locally or via Docker:
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```
2. Create a database:
   ```bash
   createdb -h localhost -U postgres poshbugati
   ```
3. Set your connection string:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/poshbugati
   ```

**Option C: Supabase**

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Settings > Database**
3. Copy the **Connection string** (URI mode)
4. Paste it as your `DATABASE_URL`

---

#### `NEXT_PUBLIC_SERVER_URL`

The URL where your app is hosted. No trailing slash.

**Development:**
```
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**Production (Vercel):**
```
NEXT_PUBLIC_SERVER_URL=https://poshbugati.com
```

---

### Optional but Recommended

#### `CRON_SECRET`

Secret used to authenticate cron jobs (e.g., Vercel cron triggers).

**Generate:**
```bash
openssl rand -base64 32
```

**Usage:** Pass as `Authorization: Bearer <CRON_SECRET>` header when triggering cron endpoints.

---

#### `PREVIEW_SECRET`

Secret used to validate preview requests for draft content.

**Generate:**
```bash
openssl rand -base64 32
```

---

### Optional Integrations

#### Cloudflare R2 / S3 (Production Storage)

For production file storage instead of local filesystem.

1. **Cloudflare R2:**
   - Go to [Cloudflare Dashboard > R2](https://dash.cloudflare.com/?to=/:account/r2)
   - Create a bucket (e.g., `poshbugati-media`)
   - Go to **R2 > Manage R2 API Tokens**
   - Create an API token with **Object Read & Write** permissions
   - Note the **Access Key ID** and **Secret Access Key**

   ```
   S3_BUCKET=poshbugati-media
   S3_REGION=auto
   S3_ACCESS_KEY_ID=your_access_key_id
   S3_SECRET_ACCESS_KEY=your_secret_access_key
   ```

2. **AWS S3:**
   - Go to AWS Console > S3
   - Create a bucket
   - Create an IAM user with `AmazonS3FullAccess` policy
   - Get access keys from IAM > Users > Security credentials

   ```
   S3_BUCKET=your-bucket-name
   S3_REGION=us-east-1
   S3_ACCESS_KEY_ID=your_access_key_id
   S3_SECRET_ACCESS_KEY=your_secret_access_key
   ```

---

#### Resend (Email)

For sending welcome emails to subscribers and broadcast newsletters.

1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys**
3. Create a new API key
4. Copy the key

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Domain Setup (Required for Production):**

1. Go to **Domains > Add Domain**
2. Enter `poshbugati.com`
3. Add the DNS records (SPF, DKIM, DMARC) to your domain registrar
4. Wait for verification (usually a few minutes)
5. You can now send from `hello@poshbugati.com`

---

#### Credo (Payments)

For processing merch and music purchases. Credo supports Card, Bank Transfer, USSD, and Wallet payments in NGN and USD.

1. Go to [app.credodemo.com](https://app.credodemo.com/register?ref=docs) and create a sandbox account
2. Go to **Settings > Developer > API Keys**
3. Copy the **Public Key** (used to initialize payments)
4. Copy the **Secret Key** (used to verify payments - never expose in client code)

```
CREDO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
CREDO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CREDO_BASE_URL=https://api.credodemo.com
```

**Going Live:**

1. Complete the [go-live checklist](https://docs.credocentral.com/docs/go-live-checklist) in your production dashboard
2. Switch to production API keys from **app.credocentral.com**
3. Update `CREDO_BASE_URL` to `https://api.credocentral.com`

```
CREDO_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
CREDO_SECRET_KEY=sk_live_xxxxxxxxxxxxx
CREDO_BASE_URL=https://api.credocentral.com
```

**Webhook Setup:**

1. In your Credo dashboard, go to **Settings > Developer > Webhooks**
2. Add webhook URL: `https://your-domain.com/api/credo/webhook`
3. Credo will send payment status updates to this endpoint

**Payment Flow:**

1. Create an order in the Orders collection
2. Call `POST /api/credo/initialize` with order details to get an `authorizationUrl`
3. Redirect customer to the `authorizationUrl` to complete payment
4. After payment, Credo redirects to `callbackUrl` with `transRef`
5. Verify the transaction server-side via `GET /api/credo/callback?transRef=xxx`
6. Webhook also fires to confirm payment

**Test Cards (Sandbox):**

| Card Number | Expiry | CVV |
|---|---|---|
| `4012000033330026` | Any future date | Any 3 digits |
| `5555555555554444` | Any future date | Any 3 digits |

See [Credo Testing Docs](https://docs.credocentral.com/docs/developers/testing) for the full list.

---

## Email

### Welcome Emails (Automatic)

When a new subscriber is created in the **Subscriptions** collection, a welcome email is sent automatically. No setup needed — just ensure `RESEND_API_KEY` is configured.

### Broadcast Emails (Bulk)

Send a broadcast to all subscribers (or filtered by type):

```bash
curl -X POST http://localhost:3000/api/email/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-admin-cookie-or-token>" \
  -d '{
    "subject": "New EP Out Now!",
    "html": "<h1>The Switch is here!</h1><p>Listen now on all platforms.</p>",
    "text": "The Switch is here! Listen now on all platforms.",
    "type": "Newsletter",
    "batchSize": 50,
    "delayMs": 1000
  }'
```

**Parameters:**

| Field | Required | Description |
|---|---|---|
| `subject` | Yes | Email subject line |
| `html` | Yes | HTML body content |
| `text` | No | Plain text fallback |
| `type` | No | Filter by subscription type (`Fan Club`, `Newsletter`, `Tour Notifications`). Omit to send to all. |
| `batchSize` | No | Emails per batch (default: 50) |
| `delayMs` | No | Delay between batches in ms (default: 1000) |

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

### Programmatic Usage

```ts
import { sendEmail, sendBroadcast } from '@/utilities/email'

// Single email
await sendEmail({
  to: 'fan@example.com',
  subject: 'Tour Update',
  html: '<p>New show added!</p>',
})

// Bulk broadcast
const result = await sendBroadcast({
  to: ['fan1@example.com', 'fan2@example.com'],
  subject: 'Tour Update',
  html: '<p>New show added!</p>',
  onProgress: (sent, total) => console.log(`${sent}/${total}`),
})
```

---

## First-Time Setup

### 1. Run Migrations

```bash
pnpm payload migrate
```

This creates all database tables based on your collections.

### 2. Create Admin User

Start the dev server and visit `http://localhost:3000/admin`. You'll be prompted to create your first admin user.

Or use the seed script:

```bash
npx tsx scripts/seed.ts
```

This creates:
- Admin user: `admin@poshbugati.com` / `password123`
- Artist profile with sample data
- 1 release (The Switch EP) with 5 tracks
- 8 tour shows
- 3 blog posts
- 6 podcast episodes
- Podcast stats
- 6 merch products

### 3. Generate TypeScript Types

After any schema changes, regenerate types:

```bash
pnpm generate:types
```

### 4. Regenerate Import Map

After adding new components or collections:

```bash
pnpm generate:importmap
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm payload migrate` | Run database migrations |
| `pnpm payload migrate:create` | Create a new migration |
| `pnpm generate:types` | Generate TypeScript types |
| `pnpm generate:importmap` | Regenerate admin import map |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |

---

## Production Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add all environment variables in Vercel's dashboard
4. Deploy

### Vercel Postgres

If using Vercel's built-in Postgres:
1. Go to **Storage > Create Database > Postgres**
2. Link to your project
3. Vercel automatically provides `POSTGRES_URL` - use this as `DATABASE_URL`

---

## Troubleshooting

### "Cannot connect to database"
- Verify `DATABASE_URL` is correct
- For Neon, ensure your IP is allowed in **Settings > IP Allowlist**
- For local PostgreSQL, ensure the service is running: `brew services list`

### "Types are stale"
- Run `pnpm generate:types` after any collection/global changes
- Restart your dev server

### "Module not found" after adding collections
- Run `pnpm generate:importmap`
- Restart your dev server

### Admin panel won't load
- Check that `PAYLOAD_SECRET` is set
- Check that migrations have been run: `pnpm payload migrate`
- Check the browser console and server logs for errors
