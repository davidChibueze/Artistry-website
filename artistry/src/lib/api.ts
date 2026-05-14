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
  SiteSetting,
  Navigation,
  Subscription,
  ContactSubmission,
  PayloadResponse,
  CredoInitializeResponse,
  CredoCallbackResponse,
} from '@/payload-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
const API_ORIGIN = API_URL.replace('/api', '')

export function getMediaUrl(
  media: { url?: string | null; sizes?: { medium?: { url?: string | null } } } | number | null | undefined
): string {
  if (!media || typeof media === 'number') return ''
  const url = media.sizes?.medium?.url || media.url || ''
  if (!url || url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined)
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
}

async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    next: init?.next,
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── Artist Profile ──

export async function getArtistProfile(revalidate = 3600) {
  const res = await fetchAPI<PayloadResponse<ArtistProfile>>('/artist-profile', {
    next: { revalidate },
  })
  return res.docs[0] ?? null
}

// ── Releases ──

export async function getReleases(
  filters?: { featured?: boolean; type?: string },
  revalidate = 300
) {
  const params: Record<string, string | number | boolean | undefined> = {
    depth: 2,
    sort: '-releaseDate',
  }
  if (filters?.featured !== undefined) params['where[featured][equals]'] = filters.featured
  if (filters?.type) params['where[type][equals]'] = filters.type
  return fetchAPI<PayloadResponse<Release>>(`/releases${buildQueryString(params)}`, {
    next: { revalidate },
  })
}

export async function getReleaseBySlug(slug: string, revalidate = 300) {
  const res = await fetchAPI<PayloadResponse<Release>>(
    `/releases${buildQueryString({ 'where[slug][equals]': slug, limit: 1, depth: 2 })}`,
    { next: { revalidate } }
  )
  return res.docs[0] ?? null
}

export async function getReleaseById(id: number, revalidate = 300) {
  return fetchAPI<Release>(`/releases/${id}`, {
    next: { revalidate },
  })
}

// ── Tour Shows ──

export async function getTourShows(
  filters?: { upcoming?: boolean; type?: string },
  revalidate = 300
) {
  const params: Record<string, string | number | boolean | undefined> = {
    sort: filters?.upcoming ? 'date' : '-date',
  }
  if (filters?.upcoming) {
    const today = new Date().toISOString().split('T')[0]
    params['where[date][greater_than_equal]'] = today
  }
  if (filters?.type) params['where[type][equals]'] = filters.type
  return fetchAPI<PayloadResponse<TourShow>>(`/tour-shows${buildQueryString(params)}`, {
    next: { revalidate },
  })
}

// ── Blog Posts ──

export async function getBlogPosts(
  filters?: { published?: boolean; category?: string; featured?: boolean; limit?: number; page?: number },
  revalidate = 60
) {
  const params: Record<string, string | number | boolean | undefined> = {
    'where[published][equals]': filters?.published ?? true,
    sort: '-publishedDate',
    depth: 2,
  }
  if (filters?.category) params['where[category][equals]'] = filters.category
  if (filters?.featured !== undefined) params['where[featured][equals]'] = filters.featured
  if (filters?.limit) params.limit = filters.limit
  if (filters?.page) params.page = filters.page
  return fetchAPI<PayloadResponse<BlogPost>>(`/blog-posts${buildQueryString(params)}`, {
    next: { revalidate },
  })
}

export async function getBlogPostBySlug(slug: string, revalidate = 60) {
  const res = await fetchAPI<PayloadResponse<BlogPost>>(
    `/blog-posts${buildQueryString({ 'where[slug][equals]': slug, limit: 1, depth: 2 })}`,
    { next: { revalidate } }
  )
  return res.docs[0] ?? null
}

// ── Podcast Episodes ──

export async function getPodcastEpisodes(
  filters?: { featured?: boolean },
  revalidate = 60
) {
  const params: Record<string, string | number | boolean | undefined> = {
    sort: '-episodeNumber',
  }
  if (filters?.featured !== undefined) params['where[featured][equals]'] = filters.featured
  return fetchAPI<PayloadResponse<PodcastEpisode>>(
    `/podcast-episodes${buildQueryString(params)}`,
    { next: { revalidate } }
  )
}

export async function getPodcastStats(revalidate = 3600) {
  const res = await fetchAPI<PayloadResponse<PodcastStat>>('/podcast-stats', {
    next: { revalidate },
  })
  return res.docs[0] ?? null
}

// ── Merch Products ──

export async function getMerchProducts(
  filters?: { inStock?: boolean; category?: string; featured?: boolean },
  revalidate = 300
) {
  const params: Record<string, string | number | boolean | undefined> = {
    depth: 2,
  }
  if (filters?.inStock !== undefined) params['where[inStock][equals]'] = filters.inStock
  if (filters?.category) params['where[category][equals]'] = filters.category
  if (filters?.featured !== undefined) params['where[featured][equals]'] = filters.featured
  return fetchAPI<PayloadResponse<MerchProduct>>(
    `/merch-products${buildQueryString(params)}`,
    { next: { revalidate } }
  )
}

export async function getMerchProductBySlug(slug: string, revalidate = 300) {
  const res = await fetchAPI<PayloadResponse<MerchProduct>>(
    `/merch-products${buildQueryString({ 'where[slug][equals]': slug, limit: 1, depth: 2 })}`,
    { next: { revalidate } }
  )
  return res.docs[0] ?? null
}

// ── Media Gallery ──

export async function getMediaGallery(
  filters?: { type?: string },
  revalidate = 3600
) {
  const params: Record<string, string | number | boolean | undefined> = {
    sort: 'order',
    depth: 2,
  }
  if (filters?.type) params['where[type][equals]'] = filters.type
  return fetchAPI<PayloadResponse<MediaGallery>>(
    `/media-gallery${buildQueryString(params)}`,
    { next: { revalidate } }
  )
}

// ── Media (Uploads) ──

export async function getMedia(
  filters?: { category?: string },
  revalidate = 3600
) {
  const params: Record<string, string | number | boolean | undefined> = {
    depth: 1,
  }
  if (filters?.category) params['where[category][equals]'] = filters.category
  return fetchAPI<PayloadResponse<Media>>(
    `/media${buildQueryString(params)}`,
    { next: { revalidate } }
  )
}

// ── Globals ──

export async function getSiteSettings(revalidate = 3600) {
  return fetchAPI<SiteSetting>('/globals/site-settings', {
    next: { revalidate },
  })
}

export async function getNavigation(revalidate = 3600) {
  return fetchAPI<Navigation>('/globals/navigation', {
    next: { revalidate },
  })
}

// ── Public Write Endpoints ──

export async function createSubscription(data: {
  email: string
  firstName?: string
  lastName?: string
  type?: string
}) {
  return fetchAPI<Subscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function createContactSubmission(data: {
  name: string
  email: string
  organization?: string
  inquiryType?: string
  eventDate?: string
  budget?: string
  message: string
}) {
  return fetchAPI<ContactSubmission>('/contact-submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Payments (Credo) ──

export async function initializePayment(data: {
  amount: number
  email: string
  currency: string
  reference: string
  callbackUrl: string
  customerFirstName?: string
  customerLastName?: string
  customerPhoneNumber?: string
  narration?: string
  metadata?: Record<string, unknown>
}) {
  return fetchAPI<CredoInitializeResponse>('/credo/initialize', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function verifyPayment(transRef: string) {
  return fetchAPI<CredoCallbackResponse>(
    `/credo/callback${buildQueryString({ transRef })}`
  )
}
