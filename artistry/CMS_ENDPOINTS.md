# Backoffice / CMS API Endpoints

All public `GET` endpoints are consumed by the Next.js frontend. All `POST`/`PUT`/`DELETE` endpoints are restricted to authenticated CMS users. Download endpoints require a valid signed token issued by the order system.

Base URL: `/api`

---

## 1. Artist Profile

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/artist` | Fetch the single artist profile record |
| `PUT` | `/api/artist` | Update the artist profile (admin) |

**Sample response — `GET /api/artist`**
```json
{
  "id": "poshbugati",
  "name": "Poshbugati",
  "tagline": "Afro Country Artist",
  "releaseDate": "2025-05-22T00:00:00.000Z",
  "bioShort": "Poshbugati is an Afro country artist and the originator of a sound that fuses West African Afrobeat rhythms with country music storytelling. His debut EP, The Switch, releases May 22, 2025, exclusively on poshbugati.com. Five tracks. One new genre. Zero compromises.",
  "bioOne": "Poshbugati — Afro country artist. Creator of The Switch EP. Where sun-kissed Afrobeat rhythms meet heartfelt country storytelling.",
  "bioLong": "Poshbugati is what happens when the dust of the savanna meets the open road...",
  "emails": {
    "booking": "booking@poshbugati.com",
    "press": "press@poshbugati.com",
    "sync": "sync@poshbugati.com",
    "general": "hello@poshbugati.com"
  },
  "socials": {
    "instagram": "https://instagram.com/poshbugati",
    "tiktok": "https://tiktok.com/@poshbugati",
    "youtube": "https://youtube.com/@poshbugati",
    "soundcloud": "https://soundcloud.com/poshbugati"
  }
}
```

---

## 2. Announcement Bar

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/announcement` | Fetch active announcement (returns `null` when none active) |
| `PUT` | `/api/announcement` | Update content or toggle active state (admin) |

**Sample response — `GET /api/announcement`**
```json
{
  "active": true,
  "text": "May 22: The Switch EP — exclusive on poshbugati.com",
  "ctaLabel": "Get early access →",
  "ctaHref": "/subscribe"
}
```

---

## 3. Releases

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/releases` | List all releases ordered by date descending |
| `GET` | `/api/releases/featured` | Latest/featured release (home + music pages) |
| `GET` | `/api/releases/:slug` | Single release with full metadata and tracks |
| `POST` | `/api/releases` | Create a release (admin) |
| `PUT` | `/api/releases/:slug` | Update a release (admin) |
| `DELETE` | `/api/releases/:slug` | Delete a release (admin) |

**Sample response — `GET /api/releases`**
```json
[
  {
    "slug": "the-switch",
    "title": "The Switch",
    "type": "ep",
    "releaseDate": "2025-05-22T00:00:00.000Z",
    "description": "Five tracks. Two worlds. The Switch is not a genre experiment — it is a declaration.",
    "coverImage": "https://cdn.poshbugati.com/releases/the-switch/cover.jpg",
    "badges": ["Latest", "Exclusive"],
    "exclusive": true,
    "trackCount": 5
  },
  {
    "slug": "new-roots",
    "title": "New Roots",
    "type": "single",
    "releaseDate": "2025-01-15T00:00:00.000Z",
    "description": "The lead single. Afrobeat groove, country heart.",
    "coverImage": "https://cdn.poshbugati.com/releases/new-roots/cover.jpg",
    "badges": ["Lead Single"],
    "exclusive": false,
    "trackCount": 1
  }
]
```

**Sample response — `GET /api/releases/the-switch`**
```json
{
  "slug": "the-switch",
  "title": "The Switch",
  "type": "ep",
  "releaseDate": "2025-05-22T00:00:00.000Z",
  "description": "Five tracks. Two worlds. The Switch is not a genre experiment — it is a declaration. Afrobeat rhythms, country soul storytelling, and a sound that refuses to belong to just one place. Exclusively on poshbugati.com from May 22, 2025.",
  "coverImage": "https://cdn.poshbugati.com/releases/the-switch/cover.jpg",
  "badges": ["Latest", "Exclusive"],
  "exclusive": true,
  "tracks": [
    {
      "number": 1,
      "name": "New Roots",
      "genre": "Afro Country",
      "duration": "3:42",
      "badge": "Lead Single",
      "previewUrl": "https://cdn.poshbugati.com/releases/the-switch/previews/01-new-roots-preview.mp3",
      "previewDuration": 30
    },
    {
      "number": 2,
      "name": "Sundown Dance",
      "genre": "Afro Country",
      "duration": "3:58",
      "badge": "",
      "previewUrl": "https://cdn.poshbugati.com/releases/the-switch/previews/02-sundown-dance-preview.mp3",
      "previewDuration": 30
    },
    {
      "number": 3,
      "name": "The Crossing",
      "genre": "Afro Country",
      "duration": "4:11",
      "badge": "",
      "previewUrl": "https://cdn.poshbugati.com/releases/the-switch/previews/03-the-crossing-preview.mp3",
      "previewDuration": 30
    },
    {
      "number": 4,
      "name": "Red Earth",
      "genre": "Afro Country",
      "duration": "3:33",
      "badge": "",
      "previewUrl": "https://cdn.poshbugati.com/releases/the-switch/previews/04-red-earth-preview.mp3",
      "previewDuration": 30
    },
    {
      "number": 5,
      "name": "Come Back Home",
      "genre": "Afro Country",
      "duration": "4:27",
      "badge": "Fan Favourite",
      "previewUrl": "https://cdn.poshbugati.com/releases/the-switch/previews/05-come-back-home-preview.mp3",
      "previewDuration": 30
    }
  ]
}
```

---

## 4. Music Distribution

### 4a. Track Previews

Pre-encoded 30-second preview clips (low bitrate, no DRM) served from CDN. The URL is embedded in the release track object above. Optionally fetched separately if the frontend lazy-loads previews.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/releases/:slug/tracks/:n/preview` | Returns preview metadata and signed stream URL |

**Sample response**
```json
{
  "trackNumber": 1,
  "trackName": "New Roots",
  "previewDuration": 30,
  "streamUrl": "https://cdn.poshbugati.com/releases/the-switch/previews/01-new-roots-preview.mp3",
  "expiresAt": "2025-06-01T00:00:00.000Z"
}
```

### 4b. Distribution Tiers

Defines the available purchase options surfaced in the distribution modal. Managed from the CMS to allow price changes without a code deploy.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/distribution/tiers` | List all active download tiers |
| `PUT` | `/api/distribution/tiers/:id` | Update a tier price or label (admin) |

**Sample response — `GET /api/distribution/tiers`**
```json
{
  "track": [
    {
      "id": "mp3",
      "label": "MP3 · 320 kbps",
      "description": "High-quality compressed",
      "format": "mp3",
      "bitrate": "320kbps",
      "price": 1.29,
      "currency": "USD",
      "active": true
    },
    {
      "id": "wav",
      "label": "WAV · Lossless",
      "description": "Studio quality, uncompressed",
      "format": "wav",
      "bitrate": "lossless",
      "price": 1.99,
      "currency": "USD",
      "active": true
    },
    {
      "id": "wav-plus",
      "label": "WAV + Digital Liner Notes",
      "description": "Lossless + lyrics & production notes PDF",
      "format": "wav+pdf",
      "bitrate": "lossless",
      "price": 2.99,
      "currency": "USD",
      "active": true
    }
  ],
  "ep": [
    {
      "id": "ep-mp3",
      "label": "Full EP — MP3 320 kbps",
      "description": "All 5 tracks",
      "format": "mp3",
      "bitrate": "320kbps",
      "price": 4.99,
      "currency": "USD",
      "active": true
    },
    {
      "id": "ep-wav",
      "label": "Full EP — WAV Lossless",
      "description": "All 5 tracks, studio quality",
      "format": "wav",
      "bitrate": "lossless",
      "price": 7.99,
      "currency": "USD",
      "active": true
    },
    {
      "id": "ep-deluxe",
      "label": "Deluxe Bundle",
      "description": "WAV + liner notes + lyrics + full artwork pack",
      "format": "wav+pdf+artwork",
      "bitrate": "lossless",
      "price": 9.99,
      "currency": "USD",
      "active": true
    }
  ]
}
```

### 4c. Streaming Platforms

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/platforms` | List all configured streaming platforms |
| `PUT` | `/api/platforms/:id` | Update a platform link or toggle active state (admin) |

**Sample response — `GET /api/platforms`**
```json
[
  {
    "id": "spotify",
    "name": "Spotify",
    "href": "https://open.spotify.com/artist/poshbugati",
    "color": "#1DB954",
    "exclusive": false,
    "active": true
  },
  {
    "id": "apple-music",
    "name": "Apple Music",
    "href": "https://music.apple.com/artist/poshbugati",
    "color": "#FC3C44",
    "exclusive": false,
    "active": true
  },
  {
    "id": "youtube-music",
    "name": "YouTube Music",
    "href": "https://music.youtube.com/channel/poshbugati",
    "color": "#FF0000",
    "exclusive": false,
    "active": true
  },
  {
    "id": "soundcloud",
    "name": "SoundCloud",
    "href": "https://soundcloud.com/poshbugati",
    "color": "#FF7700",
    "exclusive": false,
    "active": true
  },
  {
    "id": "poshbugati-com",
    "name": "poshbugati.com",
    "href": "/subscribe",
    "color": "#D4A03C",
    "exclusive": true,
    "active": true
  }
]
```

### 4d. Orders (Pay to Download)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/orders` | Create an order and return a payment intent |
| `GET` | `/api/orders/:id` | Fetch order status |
| `POST` | `/api/orders/:id/confirm` | Confirm payment and trigger file delivery |
| `GET` | `/api/orders/:id/download` | Stream or redirect to signed download URL (requires valid order) |
| `GET` | `/api/orders` | List all orders (admin) |

**`POST /api/orders` — request body**
```json
{
  "tierId": "wav",
  "releaseSlug": "the-switch",
  "trackNumber": 1,
  "email": "fan@example.com",
  "currency": "USD"
}
```

For a full EP tier, omit `trackNumber`:
```json
{
  "tierId": "ep-deluxe",
  "releaseSlug": "the-switch",
  "email": "fan@example.com",
  "currency": "USD"
}
```

**`POST /api/orders` — response**
```json
{
  "orderId": "ord_2Xk9mPqR7vLt",
  "status": "pending_payment",
  "amount": 1.99,
  "currency": "USD",
  "description": "New Roots — WAV Lossless",
  "paymentIntent": {
    "clientSecret": "pi_3Pq7LN2eZvKYlo2C_secret_...",
    "provider": "stripe"
  },
  "expiresAt": "2025-05-22T01:30:00.000Z"
}
```

**`GET /api/orders/:id` — response (after payment)**
```json
{
  "orderId": "ord_2Xk9mPqR7vLt",
  "status": "complete",
  "amount": 1.99,
  "currency": "USD",
  "description": "New Roots — WAV Lossless",
  "email": "fan@example.com",
  "paidAt": "2025-05-22T00:14:38.000Z",
  "downloadUrl": "https://cdn.poshbugati.com/orders/ord_2Xk9mPqR7vLt/new-roots.wav?token=eyJ...",
  "downloadExpiresAt": "2025-05-25T00:14:38.000Z",
  "downloadCount": 0,
  "downloadLimit": 5
}
```

**Order status values:** `pending_payment` | `complete` | `refunded` | `expired`

---

## 5. Tour Shows

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/shows` | List all shows. Accepts `?status=upcoming\|past` |
| `GET` | `/api/shows/:id` | Single show |
| `POST` | `/api/shows` | Create a show (admin) |
| `PUT` | `/api/shows/:id` | Update show details or sold-out status (admin) |
| `DELETE` | `/api/shows/:id` | Remove a show (admin) |

**Sample response — `GET /api/shows?status=upcoming`**
```json
[
  {
    "id": "show_001",
    "date": "2025-05-22T20:00:00.000Z",
    "name": "The Switch — EP Launch Night",
    "venue": "The Shrine",
    "city": "Lagos",
    "country": "Nigeria",
    "type": "Headline",
    "soldOut": false,
    "ticketUrl": "https://tickets.example.com/poshbugati-launch",
    "status": "upcoming"
  },
  {
    "id": "show_002",
    "date": "2025-06-07T19:00:00.000Z",
    "name": "Afro Nation Pre-Party",
    "venue": "Eko Hotel & Suites",
    "city": "Lagos",
    "country": "Nigeria",
    "type": "Festival",
    "soldOut": false,
    "ticketUrl": "https://tickets.example.com/afro-nation-preparty",
    "status": "upcoming"
  },
  {
    "id": "show_003",
    "date": "2025-08-02T18:00:00.000Z",
    "name": "The Switch Tour — Toronto",
    "venue": "HISTORY",
    "city": "Toronto",
    "country": "Canada",
    "type": "Tour",
    "soldOut": true,
    "ticketUrl": null,
    "status": "upcoming"
  }
]
```

---

## 6. Blog / Journal Posts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/posts` | List posts. Accepts `?category=&page=&limit=` |
| `GET` | `/api/posts/featured` | The single featured post (hero card on blog page) |
| `GET` | `/api/posts/:slug` | Single post with full body content |
| `POST` | `/api/posts` | Create a post (admin) |
| `PUT` | `/api/posts/:slug` | Update a post (admin) |
| `DELETE` | `/api/posts/:slug` | Delete a post (admin) |

**Sample response — `GET /api/posts?limit=2`**
```json
{
  "total": 6,
  "page": 1,
  "limit": 2,
  "posts": [
    {
      "slug": "what-is-afro-country",
      "category": "Interview",
      "title": "What Is Afro Country? Poshbugati Explains",
      "excerpt": "A genre is born not in a studio, but in the moment you stop apologising for the music you love.",
      "author": "Poshbugati",
      "readTime": "5 min",
      "publishedAt": "2025-04-18T09:00:00.000Z",
      "coverImage": "https://cdn.poshbugati.com/blog/what-is-afro-country/cover.jpg",
      "featured": false
    },
    {
      "slug": "story-behind-sundown-dance",
      "category": "Behind the Track",
      "title": "The Story Behind Sundown Dance",
      "excerpt": "Track two of The Switch started as a voice memo at 2am.",
      "author": "Poshbugati",
      "readTime": "4 min",
      "publishedAt": "2025-04-05T09:00:00.000Z",
      "coverImage": "https://cdn.poshbugati.com/blog/sundown-dance/cover.jpg",
      "featured": false
    }
  ]
}
```

**Sample response — `GET /api/posts/making-the-switch`**
```json
{
  "slug": "making-the-switch",
  "category": "Feature",
  "title": "Making The Switch: A Genre Has No Borders",
  "excerpt": "The full story of how The Switch came together — from a bedroom in Lagos to studios in Nashville.",
  "body": "# Making The Switch\n\nEverything started with a voice memo...",
  "author": "Poshbugati",
  "readTime": "8 min",
  "publishedAt": "2025-05-01T09:00:00.000Z",
  "coverImage": "https://cdn.poshbugati.com/blog/making-the-switch/cover.jpg",
  "featured": true
}
```

---

## 7. Podcast Episodes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/episodes` | List all episodes ordered by number descending |
| `GET` | `/api/episodes/:number` | Single episode |
| `POST` | `/api/episodes` | Create an episode (admin) |
| `PUT` | `/api/episodes/:number` | Update an episode (admin) |
| `DELETE` | `/api/episodes/:number` | Delete an episode (admin) |
| `GET` | `/api/podcast/stats` | Fetch display stats |
| `PUT` | `/api/podcast/stats` | Update stats (admin) |

**Sample response — `GET /api/episodes`**
```json
[
  {
    "number": 12,
    "title": "Making The Switch: Inside the EP",
    "description": "Poshbugati takes us behind the boards — how the five tracks came together, what was left on the cutting room floor, and why this EP had to exist.",
    "publishedAt": "2025-04-24T06:00:00.000Z",
    "duration": "52 min",
    "tags": ["Making Of", "The Switch"],
    "featured": true,
    "audioUrl": "https://cdn.poshbugati.com/podcast/ep12.mp3"
  },
  {
    "number": 11,
    "title": "Country Soul and African Groove: The Same Conversation",
    "description": "A deep-dive into the musical DNA shared by country music and Afrobeat.",
    "publishedAt": "2025-04-10T06:00:00.000Z",
    "duration": "44 min",
    "tags": ["Analysis", "Genre"],
    "featured": false,
    "audioUrl": "https://cdn.poshbugati.com/podcast/ep11.mp3"
  }
]
```

**Sample response — `GET /api/podcast/stats`**
```json
{
  "episodeCount": "12",
  "listeners": "40k+",
  "frequency": "2x",
  "avgRating": "5★"
}
```

---

## 8. Merch / Products

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List all products. Accepts `?category=` |
| `GET` | `/api/products/bundle` | Featured bundle (hero card on merch page) |
| `GET` | `/api/products/:id` | Single product |
| `POST` | `/api/products` | Create a product (admin) |
| `PUT` | `/api/products/:id` | Update product, stock, or pricing (admin) |
| `DELETE` | `/api/products/:id` | Remove a product (admin) |

**Sample response — `GET /api/products`**
```json
[
  {
    "id": "prod_001",
    "category": "Apparel",
    "name": "The Switch Tee",
    "variants": "S / M / L / XL / XXL · Black",
    "price": 35.00,
    "originalPrice": null,
    "badge": "Limited",
    "badgeVariant": "gold",
    "inStock": true,
    "image": "https://cdn.poshbugati.com/merch/switch-tee.jpg"
  },
  {
    "id": "prod_002",
    "category": "Music",
    "name": "The Switch Vinyl LP",
    "variants": "180g · Gatefold sleeve",
    "price": 45.00,
    "originalPrice": null,
    "badge": "Exclusive",
    "badgeVariant": "amber",
    "inStock": true,
    "image": "https://cdn.poshbugati.com/merch/switch-vinyl.jpg"
  }
]
```

**Sample response — `GET /api/products/bundle`**
```json
{
  "id": "prod_bundle",
  "category": "Bundle",
  "name": "The Complete Switch Bundle",
  "kicker": "Best Value · Limited",
  "description": "Everything you need to own The Switch experience. One drop, one chance. Ships the week of May 22.",
  "includes": [
    "The Switch EP — 180g vinyl",
    "Exclusive The Switch Tee (Limited Print)",
    "Digital Liner Notes PDF (signed)",
    "Early stream access — 48hrs before release",
    "Handwritten thank-you postcard"
  ],
  "price": 85.00,
  "originalPrice": 120.00,
  "badge": "Save 30%",
  "badgeVariant": "gold",
  "inStock": true,
  "image": "https://cdn.poshbugati.com/merch/bundle.jpg"
}
```

---

## 9. Media & Press

### Photos

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/media/photos` | List all press photos |
| `POST` | `/api/media/photos` | Upload a photo (admin) |
| `DELETE` | `/api/media/photos/:id` | Remove a photo (admin) |

**Sample response — `GET /api/media/photos`**
```json
[
  {
    "id": "photo_001",
    "url": "https://cdn.poshbugati.com/press/photos/portrait-01.jpg",
    "hiResUrl": "https://cdn.poshbugati.com/press/photos/portrait-01-hires.jpg",
    "altText": "Poshbugati portrait — press use",
    "order": 1
  },
  {
    "id": "photo_002",
    "url": "https://cdn.poshbugati.com/press/photos/live-sxsw-01.jpg",
    "hiResUrl": "https://cdn.poshbugati.com/press/photos/live-sxsw-01-hires.jpg",
    "altText": "Poshbugati live at SXSW 2025",
    "order": 2
  }
]
```

### Videos

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/media/videos` | List all videos |
| `POST` | `/api/media/videos` | Add a video (admin) |
| `PUT` | `/api/media/videos/:id` | Update video metadata (admin) |
| `DELETE` | `/api/media/videos/:id` | Remove a video (admin) |

**Sample response — `GET /api/media/videos`**
```json
[
  {
    "id": "vid_001",
    "title": "New Roots — Official Music Video",
    "meta": "2025 · Dir. Tunde Adeyemi · 3:42",
    "thumbnailUrl": "https://cdn.poshbugati.com/media/videos/new-roots-thumb.jpg",
    "videoUrl": "https://www.youtube.com/watch?v=example"
  },
  {
    "id": "vid_002",
    "title": "Live at SXSW 2025 — Full Set",
    "meta": "Austin, TX · Mar 15, 2025 · 28 min",
    "thumbnailUrl": "https://cdn.poshbugati.com/media/videos/sxsw-thumb.jpg",
    "videoUrl": "https://www.youtube.com/watch?v=example2"
  }
]
```

### Press Quotes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/press/quotes` | List all press quotes |
| `POST` | `/api/press/quotes` | Add a quote (admin) |
| `PUT` | `/api/press/quotes/:id` | Edit a quote (admin) |
| `DELETE` | `/api/press/quotes/:id` | Remove a quote (admin) |

**Sample response — `GET /api/press/quotes`**
```json
[
  {
    "id": "quote_001",
    "publication": "Music Week Africa · Apr 2025",
    "quote": "Poshbugati is doing something genuinely new. The Switch doesn't sound like a debut — it sounds like an arrival.",
    "articleUrl": "https://musicweekafrica.com/poshbugati-review"
  },
  {
    "id": "quote_002",
    "publication": "Rolling Stone Africa · Mar 2025",
    "quote": "Afro country was always coming. Poshbugati just got there first.",
    "articleUrl": "https://rollingstoneafrica.com/poshbugati"
  }
]
```

### EPK Downloads

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/press/downloads` | List all downloadable EPK assets |
| `POST` | `/api/press/downloads` | Add a download file (admin) |
| `PUT` | `/api/press/downloads/:id` | Update a download (admin) |
| `DELETE` | `/api/press/downloads/:id` | Remove a download (admin) |

**Sample response — `GET /api/press/downloads`**
```json
[
  {
    "id": "dl_001",
    "name": "Official Artist Bio (Short)",
    "description": "PDF · 120 words · English",
    "fileUrl": "https://cdn.poshbugati.com/epk/bio-short.pdf",
    "iconType": "FileText",
    "order": 1
  },
  {
    "id": "dl_002",
    "name": "Press Photos — Hi-Res Pack",
    "description": "ZIP · 7 photos · 300dpi",
    "fileUrl": "https://cdn.poshbugati.com/epk/photos-hires.zip",
    "iconType": "Image",
    "order": 3
  },
  {
    "id": "dl_003",
    "name": "Complete Press Kit (All Assets)",
    "description": "ZIP · 180MB · All of the above",
    "fileUrl": "https://cdn.poshbugati.com/epk/complete-kit.zip",
    "iconType": "Archive",
    "order": 6
  }
]
```

---

## 10. Newsletter & Subscriptions

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/subscribe` | Fan club inner circle sign-up |
| `POST` | `/api/newsletter` | Blog journal newsletter sign-up |
| `POST` | `/api/notify/tour` | Tour date notification sign-up |
| `GET` | `/api/subscribe/list` | List all subscribers (admin) |
| `GET` | `/api/newsletter/list` | List newsletter subscribers (admin) |
| `GET` | `/api/notify/tour/list` | List tour notification subscribers (admin) |

**`POST /api/subscribe` — request body**
```json
{
  "email": "fan@example.com",
  "firstName": "Amara",
  "lastName": "Okafor"
}
```

**`POST /api/subscribe` — response**
```json
{
  "success": true,
  "message": "You're on the list. Check your inbox for early access details.",
  "subscriberId": "sub_9kLmVpQx"
}
```

**`POST /api/newsletter` — request body**
```json
{ "email": "reader@example.com" }
```

**`POST /api/notify/tour` — request body**
```json
{ "email": "fan@example.com" }
```

---

## 11. Contact / Inquiry Form

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/contact` | Submit a contact inquiry |
| `GET` | `/api/contact/submissions` | List all submissions (admin) |
| `PUT` | `/api/contact/submissions/:id` | Mark submission as read/actioned (admin) |

**`POST /api/contact` — request body**
```json
{
  "name": "Sarah Mensah",
  "email": "sarah@festivaldirector.com",
  "organisation": "Afropunk Festival",
  "type": "booking",
  "proposedDate": "September 6, 2025",
  "budget": "$15,000 – $50,000",
  "message": "We'd love to have Poshbugati headline the main stage at Afropunk Brooklyn this September. Please send over the full rider and tech spec when you get a chance."
}
```

**`POST /api/contact` — response**
```json
{
  "success": true,
  "submissionId": "sub_7rTnKqWz",
  "message": "Message received. We'll be in touch within 48 hours."
}
```

**`GET /api/contact/submissions` — sample item**
```json
{
  "id": "sub_7rTnKqWz",
  "name": "Sarah Mensah",
  "email": "sarah@festivaldirector.com",
  "organisation": "Afropunk Festival",
  "type": "booking",
  "proposedDate": "September 6, 2025",
  "budget": "$15,000 – $50,000",
  "message": "We'd love to have Poshbugati headline...",
  "submittedAt": "2025-05-06T14:23:00.000Z",
  "read": false,
  "actioned": false
}
```

---

## Data domain summary

| Domain | Source files | API endpoints |
|--------|-------------|---------------|
| Artist profile | `Footer.tsx`, `about/page.tsx`, `ContactForm.tsx`, `MediaContent.tsx`, `AnnounceBar.tsx` | `/api/artist` |
| Announcement | `AnnounceBar.tsx` | `/api/announcement` |
| Releases + tracks | `MusicPlayer.tsx`, `music/page.tsx`, `page.tsx` | `/api/releases/*` |
| Track previews | `MusicPlayer.tsx` | `/api/releases/:slug/tracks/:n/preview` |
| Distribution tiers | `DistributionModal.tsx` | `/api/distribution/tiers` |
| Streaming platforms | `DistributionModal.tsx`, `music/page.tsx`, `page.tsx` | `/api/platforms` |
| Orders / pay-to-download | `DistributionModal.tsx` | `/api/orders/*` |
| Tour shows | `TourContent.tsx` | `/api/shows` |
| Blog posts | `BlogContent.tsx`, `page.tsx` | `/api/posts/*` |
| Podcast episodes | `podcast/page.tsx` | `/api/episodes/*` |
| Merch products | `MerchContent.tsx` | `/api/products/*` |
| Press photos | `MediaContent.tsx` | `/api/media/photos` |
| Videos | `MediaContent.tsx` | `/api/media/videos` |
| Press quotes | `MediaContent.tsx`, `about/page.tsx` | `/api/press/quotes` |
| EPK downloads | `MediaContent.tsx` | `/api/press/downloads` |
| Subscriptions | `SubscribePageClient.tsx`, `BlogContent.tsx`, `TourContent.tsx` | `/api/subscribe`, `/api/newsletter`, `/api/notify/tour` |
| Contact inquiries | `ContactForm.tsx` | `/api/contact/*` |
