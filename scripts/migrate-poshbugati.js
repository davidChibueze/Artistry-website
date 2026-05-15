#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { JSDOM, VirtualConsole } = require('../artist-admin/node_modules/jsdom')
const dotenv = require('../artist-admin/node_modules/dotenv')

const ROOT_DIR = path.resolve(__dirname, '..')
const ADMIN_ENV_PATH = path.join(ROOT_DIR, 'artist-admin', '.env')
const ROOT_ENV_PATH = path.join(ROOT_DIR, '.env')

if (fs.existsSync(ROOT_ENV_PATH)) dotenv.config({ path: ROOT_ENV_PATH })
if (fs.existsSync(ADMIN_ENV_PATH)) dotenv.config({ path: ADMIN_ENV_PATH, override: false })

const OLD_SITE_ORIGIN = 'https://poshbugati.com'
const DEFAULT_API_URL = 'https://artistry-website-alpha.vercel.app/api'
const API_URL = normalizeApiUrl(
  process.env.PAYLOAD_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    DEFAULT_API_URL,
)

const ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD

const REQUIRED_ENV = ['PAYLOAD_ADMIN_EMAIL', 'PAYLOAD_ADMIN_PASSWORD']

const virtualConsole = new VirtualConsole()
virtualConsole.on('error', () => {})
virtualConsole.on('warn', () => {})

const TRACK_DATE_HINTS = {
  'Sweet Vibes EP': '2021-09-08',
  'Colorado Girl': '2021-09-08',
  'Influencer Whoop Remix': '2022-12-08',
}

const RELEASE_DESCRIPTION_HINTS = {
  'Sweet Vibes EP': 'Six-track EP migrated from the original poshbugati.com catalog.',
  Outsiders: 'Single migrated from the original poshbugati.com catalog.',
  'Influencer Whoop Remix':
    'Afro-dancehall single migrated from the original poshbugati.com catalog.',
  Aje: 'Single migrated from the original poshbugati.com catalog.',
  'Colorado Girl': 'Single migrated from the original poshbugati.com catalog.',
  'No Fight': 'Single migrated from the original poshbugati.com catalog.',
  Solidarity: 'Call-for-unity single migrated from the original poshbugati.com catalog.',
}

let authToken = ''

const summary = {
  collections: {
    media: { created: 0, updated: 0, skipped: 0 },
    'artist-profile': { created: 0, updated: 0, skipped: 0 },
    releases: { created: 0, updated: 0, skipped: 0 },
    'media-gallery': { created: 0, updated: 0, skipped: 0 },
    globals: { created: 0, updated: 0, skipped: 0 },
  },
  failed: [],
  unmatched: [],
  notes: [],
}

function normalizeApiUrl(input) {
  const trimmed = String(input || '').trim().replace(/\/+$/, '')
  if (!trimmed) return DEFAULT_API_URL
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function makeRichText(paragraphs) {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

function createDocument(html, url) {
  return new JSDOM(html, { url, virtualConsole }).window.document
}

function toAbsoluteUrl(value, origin = OLD_SITE_ORIGIN) {
  if (!value) return ''
  const input = String(value).trim()
  if (!input) return ''
  if (input.startsWith('//')) return `https:${input}`
  if (/^https?:\/\//i.test(input)) return input
  return new URL(input, origin).href
}

function toOriginalAssetUrl(value) {
  const absolute = toAbsoluteUrl(value)
  if (!absolute) return ''
  return absolute.split('/!!/')[0]
}

function filenameFromUrl(value, fallbackBase = 'file') {
  const url = new URL(value)
  const pathname = url.pathname.split('/!!/')[0]
  let name = decodeURIComponent(path.basename(pathname))
  if (!name || name === '/') {
    const ext = guessExtensionFromContentType(url.searchParams.get('contentType') || '')
    name = `${fallbackBase}${ext}`
  }
  return sanitizeFilename(name)
}

function sanitizeFilename(value) {
  return String(value || 'file')
    .replace(/[?#].*$/, '')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function guessExtensionFromContentType(contentType) {
  if (!contentType) return ''
  if (contentType.includes('jpeg')) return '.jpg'
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('gif')) return '.gif'
  if (contentType.includes('svg')) return '.svg'
  if (contentType.includes('mpeg')) return '.mp3'
  if (contentType.includes('wav')) return '.wav'
  return ''
}

function parsePayloadError(body, status) {
  if (!body) return `HTTP ${status}`
  if (typeof body === 'string') return body.slice(0, 400)
  if (body.errors?.length) {
    return body.errors
      .map((error) => error.message || JSON.stringify(error))
      .join('; ')
      .slice(0, 600)
  }
  if (body.message) return String(body.message)
  return JSON.stringify(body).slice(0, 600)
}

function pushFailure(collection, record, error) {
  summary.failed.push({
    collection,
    record,
    reason: error instanceof Error ? error.message : String(error),
  })
}

function bump(collection, action) {
  if (!summary.collections[collection]) {
    summary.collections[collection] = { created: 0, updated: 0, skipped: 0 }
  }
  summary.collections[collection][action] += 1
}

async function request(pathname, options = {}) {
  const headers = new Headers(options.headers || {})
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `JWT ${authToken}`)
  }

  const response = await fetch(`${API_URL}${pathname}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null)

  if (!response.ok) {
    throw new Error(parsePayloadError(body, response.status))
  }

  return body
}

async function login() {
  const response = await request('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  if (!response?.token) {
    throw new Error('Login succeeded without a token in the response.')
  }

  authToken = response.token
}

async function fetchOldPage(route) {
  const url = toAbsoluteUrl(route, OLD_SITE_ORIGIN)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  const html = await response.text()
  return { route, url, html, doc: createDocument(html, url) }
}

function extractJsonLdSameAs(doc) {
  const urls = []
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const text = script.textContent?.trim()
    if (!text) continue
    try {
      const parsed = JSON.parse(text)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (Array.isArray(item?.sameAs)) urls.push(...item.sameAs)
      }
    } catch {
      continue
    }
  }
  return urls
}

function extractSocialLinks(...docs) {
  const urls = unique(
    docs.flatMap((doc) => [
      ...[...doc.querySelectorAll('a[href]')].map((anchor) => anchor.href),
      ...extractJsonLdSameAs(doc),
    ]),
  )

  const getMatch = (pattern) => urls.find((url) => pattern.test(url)) || ''

  const appleRaw = getMatch(/itunes\.apple\.com|music\.apple\.com/i)
  const appleMusicMatch = appleRaw.match(/https:\/\/music\.apple\.com\/[^\s"']+/i)

  return {
    instagram: getMatch(/instagram\.com/i),
    spotify: getMatch(/spotify\.com/i),
    appleMusic: appleMusicMatch ? appleMusicMatch[0] : appleRaw,
    youtube: getMatch(/youtube\.com/i),
    twitter: getMatch(/twitter\.com|x\.com/i),
    tiktok: getMatch(/tiktok\.com/i),
  }
}

function extractArtistData(homePage, contactPage) {
  const bodyText = normalizeText(homePage.doc.body.textContent)
  const aboutMatch = bodyText.match(/ABOUT\s+(.+?)\s+NEW POSHBUGATI RELEASES/i)
  const candidateParagraphs = [
    aboutMatch?.[1],
    ...[...homePage.doc.querySelectorAll('p')]
      .map((node) => normalizeText(node.textContent))
      .filter((text) => text.length > 80),
  ]
  const bioParagraphs = unique(
    candidateParagraphs.filter(
      (text) =>
        /Emmanuel George Akpose|The now Miami|With two mammoth singles|With his flexible/i.test(
          text,
        ),
    ),
  )

  const images = [...homePage.doc.querySelectorAll('img[src]')]
    .map((img) => toOriginalAssetUrl(img.getAttribute('src')))
    .filter(Boolean)

  const homeDescription =
    homePage.doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  const generalEmail =
    contactPage.doc.querySelector('a[href^="mailto:"]')?.getAttribute('href')?.replace(/^mailto:/, '') ||
    ''
  const whatsapp =
    contactPage.doc
      .querySelector('a[href*="wa.me"], a[href*="whatsapp"]')
      ?.getAttribute('href') || ''

  return {
    name: normalizeText(homePage.doc.querySelector('h1')?.textContent) || 'Poshbugati',
    tagline: 'Afro-pop artist from Jos Plateau, Nigeria',
    bioParagraphs,
    homeDescription: normalizeText(homeDescription),
    heroImageUrl: images[0] || '',
    portraitImageUrl: images[1] || images[0] || '',
    generalEmail,
    whatsapp: toAbsoluteUrl(whatsapp),
  }
}

async function getTrackPageMeta(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch track page ${url}: ${response.status} ${response.statusText}`)
  }
  const html = await response.text()
  const doc = createDocument(html, url)
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || ''
  const dateMatch = html.match(/\b20\d{2}-\d{2}-\d{2}\b/)
  const mp3Match = html.match(/\/player\/tracks\/\d+\.mp3(?:\?[^"'\\s<]+)?/)

  return {
    description,
    date: dateMatch ? dateMatch[0] : '',
    previewUrl: mp3Match ? toAbsoluteUrl(mp3Match[0], OLD_SITE_ORIGIN) : '',
  }
}

function buildBaseStreamingLinks(socials) {
  const links = []
  if (socials.spotify) links.push({ platform: 'Spotify', url: socials.spotify })
  if (socials.appleMusic) links.push({ platform: 'Apple Music', url: socials.appleMusic })
  if (socials.youtube) links.push({ platform: 'YouTube Music', url: socials.youtube })
  return links
}

async function extractReleases(musicPage, solidarityPage, socials, outsidersStreamUrl) {
  const pages = [musicPage.doc, solidarityPage.doc]
  const releaseMap = new Map()
  const baseStreamingLinks = buildBaseStreamingLinks(socials)

  for (const doc of pages) {
    for (const article of doc.querySelectorAll('article.music-player.display-album')) {
      const title = normalizeText(
        article.querySelector('h1.heading-album, h1, .heading-album')?.textContent,
      )
      if (!title) continue

      const coverImageUrl = toOriginalAssetUrl(
        article.querySelector('figure .main-image')?.getAttribute('href') ||
          article.querySelector('img')?.getAttribute('src'),
      )

      const rowNodes = [...article.querySelectorAll('.track-list-item')]
      const tracks = []
      const trackMetas = []

      for (const [index, row] of rowNodes.entries()) {
        const trackNumber = Number.parseInt(
          normalizeText(row.querySelector('.track-number')?.textContent),
          10,
        )
        const titleNode = row.querySelector('.track-title .title, .track-title .text-main, .text-main .title')
        const trackTitle = normalizeText(titleNode?.textContent)
        const trackUrl = toAbsoluteUrl(
          row.querySelector('a[href*="/track/"]')?.getAttribute('href'),
          OLD_SITE_ORIGIN,
        )
        const previewData = row.querySelector('[data-dest]')?.getAttribute('data-dest')
        const previewUrl = toAbsoluteUrl(previewData, OLD_SITE_ORIGIN)
        const duration =
          normalizeText(row.querySelector('.duration')?.textContent) ||
          row.querySelector('[data-duration]')?.getAttribute('data-duration') ||
          ''
        const price = Number.parseFloat(row.querySelector('form[data-min-price]')?.getAttribute('data-min-price') || '')
        let trackPageMeta = { description: '', date: '', previewUrl: '' }

        if (trackUrl) {
          try {
            trackPageMeta = await getTrackPageMeta(trackUrl)
          } catch (error) {
            pushFailure('releases', `${title} > ${trackTitle || `Track ${index + 1}`}`, error)
          }
        }

        trackMetas.push(trackPageMeta)

        tracks.push({
          number: Number.isFinite(trackNumber) ? trackNumber : index + 1,
          title: trackTitle || `Track ${index + 1}`,
          subtitle: 'Afro-pop',
          duration: duration || undefined,
          badge: rowNodes.length === 1 ? 'Single' : undefined,
          previewUrl: previewUrl || trackPageMeta.previewUrl || undefined,
          sourceUrl: trackUrl || undefined,
          minPrice: Number.isFinite(price) ? price : undefined,
          sourceDescription: trackPageMeta.description || undefined,
        })
      }

      const releaseType = /EP$/i.test(title) ? 'EP' : 'Single'
      const downloadHref = article.querySelector('.album-download a.download')?.getAttribute('href') || ''
      const downloadUrl = downloadHref && downloadHref !== '#'
        ? toAbsoluteUrl(downloadHref, OLD_SITE_ORIGIN)
        : ''
      const releasePrice = Number.parseFloat(
        article.querySelector('.album-download form[data-min-price]')?.getAttribute('data-min-price') ||
          article.querySelector('form[data-min-price]')?.getAttribute('data-min-price') ||
          '',
      )
      const pageDescription =
        tracks.find((track) => track.sourceDescription && !/ by Poshbugati$/i.test(track.sourceDescription))
          ?.sourceDescription || ''

      const releaseDate =
        trackMetas.map((meta) => meta.date).find(Boolean) || TRACK_DATE_HINTS[title] || ''

      const streamingLinks = [...baseStreamingLinks]
      if (title === 'Outsiders' && outsidersStreamUrl) {
        streamingLinks.push({ platform: 'SoundCloud', url: outsidersStreamUrl })
      }

      const distributionTiers = []
      if (Number.isFinite(releasePrice)) {
        distributionTiers.push({
          label: releaseType === 'EP' ? 'Digital EP Download' : 'Digital Download',
          description: downloadUrl
            ? `Original download link: ${downloadUrl}`
            : 'Original minimum-price download on poshbugati.com',
          price: releasePrice,
          currency: 'USD',
        })
      } else if (downloadUrl) {
        distributionTiers.push({
          label: releaseType === 'EP' ? 'Digital EP Download' : 'Digital Download',
          description: `Original download link: ${downloadUrl}`,
          currency: 'USD',
        })
      }

      releaseMap.set(title, {
        title,
        slug: slugify(title),
        type: releaseType,
        coverImageUrl,
        releaseDate: releaseDate || undefined,
        description:
          normalizeText(pageDescription) ||
          RELEASE_DESCRIPTION_HINTS[title] ||
          `${title} by Poshbugati, migrated from the original poshbugati.com catalog.`,
        featured: title === 'Sweet Vibes EP',
        tracks: tracks.map(({ sourceUrl, minPrice, sourceDescription, ...track }) => track),
        streamingLinks,
        distributionTiers,
      })
    }
  }

  return [...releaseMap.values()]
}

function extractVideoIds(videosPage) {
  const html = videosPage.html
  return unique(
    [...html.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)].map((match) => match[1]),
  )
}

async function getYouTubeMeta(videoId, index) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`

  try {
    const response = await fetch(oembedUrl)
    if (!response.ok) throw new Error(`oEmbed ${response.status}`)
    const payload = await response.json()
    return {
      title: payload.title || `Video ${index + 1}`,
      videoUrl: watchUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    }
  } catch {
    return {
      title: `Video ${index + 1}`,
      videoUrl: watchUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    }
  }
}

function extractGalleryImages(galleryPage) {
  return unique(
    [...galleryPage.doc.querySelectorAll('.gallery-item a[href], a.gallery-item[href], a[href*="images.zoogletools.com"]')]
      .map((anchor) => toOriginalAssetUrl(anchor.getAttribute('href')))
      .filter((href) => /\.(jpe?g|png|gif|webp)$/i.test(href)),
  )
}

async function fetchCollection(collection, params = {}) {
  const search = new URLSearchParams({ depth: '0', ...params })
  return request(`/${collection}?${search.toString()}`)
}

async function findOne(collection, field, value) {
  const response = await fetchCollection(collection, {
    limit: '1',
    [`where[${field}][equals]`]: value,
  })
  return response.docs?.[0] || null
}

async function getExistingArtistProfile() {
  const response = await fetchCollection('artist-profile', { limit: '1' })
  return response.docs?.[0] || null
}

async function uploadMediaFromUrl(sourceUrl, metadata) {
  if (!sourceUrl) throw new Error('Missing source URL for media upload.')

  const filename = metadata.filename || filenameFromUrl(sourceUrl, slugify(metadata.alt || 'media'))
  const existing = await findOne('media', 'filename', filename)
  if (existing) {
    bump('media', 'skipped')
    return existing
  }

  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to download media ${sourceUrl}: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream'
  const buffer = Buffer.from(await response.arrayBuffer())
  const formData = new FormData()
  formData.append('alt', metadata.alt || '')
  formData.append('caption', metadata.caption || '')
  formData.append('category', metadata.category || 'Other')
  formData.append('file', new Blob([buffer], { type: contentType }), filename)

  const uploaded = await request('/media', {
    method: 'POST',
    body: formData,
  })

  bump('media', 'created')
  return uploaded
}

async function upsertArtistProfile(data) {
  const existing = await getExistingArtistProfile()
  const payload = {
    name: data.name,
    tagline: data.tagline,
    bio: makeRichText(data.bioParagraphs),
    heroImage: data.heroImageId || null,
    portraitImage: data.portraitImageId || null,
    principles: [],
    timeline: [],
    pressQuotes: [],
    socialLinks: {
      instagram: data.socials.instagram || '',
      tiktok: data.socials.tiktok || '',
      youtube: data.socials.youtube || '',
      soundcloud: '',
      linktree: '',
    },
    contactEmails: {
      general: data.generalEmail || '',
      booking: '',
      press: '',
    },
  }

  if (existing) {
    const updated = await request(`/artist-profile/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    bump('artist-profile', 'updated')
    return updated
  }

  const created = await request('/artist-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  bump('artist-profile', 'created')
  return created
}

async function updateSiteSettings(data) {
  const payload = {
    siteTitle: data.name,
    siteDescription: data.homeDescription || data.bioParagraphs[0] || '',
    ogImage: data.heroImageId || null,
    announcementBar: {
      enabled: false,
      text: '',
      linkText: '',
      linkUrl: '',
      startDate: null,
      endDate: null,
    },
    epReleaseDate: data.featuredReleaseDate || null,
    cdnUrl: '',
    footerText: '© Poshbugati. All rights reserved.',
  }

  const updated = await request('/globals/site-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  bump('globals', 'updated')
  return updated
}

function sanitizeReleasePayload(release, coverImageValue) {
  return {
    title: release.title,
    slug: release.slug,
    type: release.type,
    coverImage: coverImageValue,
    releaseDate: release.releaseDate || undefined,
    description: release.description || undefined,
    featured: Boolean(release.featured),
    tracks: (release.tracks || []).map((track) => ({
      number: track.number,
      title: track.title,
      subtitle: track.subtitle || undefined,
      duration: track.duration || undefined,
      badge: track.badge || undefined,
      previewUrl: track.previewUrl || undefined,
    })),
    streamingLinks: (release.streamingLinks || []).filter(
      (item) => item?.platform && item?.url,
    ),
    distributionTiers: (release.distributionTiers || []).map((tier) => ({
      label: tier.label,
      description: tier.description || undefined,
      price: Number.isFinite(tier.price) ? tier.price : undefined,
      currency: tier.currency || 'USD',
    })),
  }
}

async function upsertRelease(release) {
  if (!Number.isFinite(release.coverImageId)) {
    throw new Error(`Missing numeric cover image ID for ${release.title}.`)
  }

  const existing = await findOne('releases', 'title', release.title)
  const payload = sanitizeReleasePayload(release, release.coverImageId)
  const retryPayload = sanitizeReleasePayload(release, String(release.coverImageId))

  if (existing) {
    try {
      const updated = await request(`/releases/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      bump('releases', 'updated')
      return updated
    } catch (error) {
      const updated = await request(`/releases/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryPayload),
      })
      bump('releases', 'updated')
      summary.notes.push(
        `Release "${release.title}" required a retry with a string relation value for coverImage.`,
      )
      return updated
    }
  }

  try {
    const created = await request('/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    bump('releases', 'created')
    return created
  } catch (error) {
    const created = await request('/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(retryPayload),
    })
    bump('releases', 'created')
    summary.notes.push(
      `Release "${release.title}" required a retry with a string relation value for coverImage.`,
    )
    return created
  }
}

async function normalizeFeaturedReleases(migratedTitles) {
  const response = await fetchCollection('releases', {
    limit: '100',
    'where[featured][equals]': 'true',
  })

  for (const doc of response.docs || []) {
    if (doc.title === 'Sweet Vibes EP') continue
    if (migratedTitles.includes(doc.title)) continue
    try {
      await request(`/releases/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: false }),
      })
      bump('releases', 'updated')
    } catch (error) {
      pushFailure('releases', doc.title || `release:${doc.id}`, error)
    }
  }
}

async function upsertGalleryPhoto(item) {
  const existing = await findOne('media-gallery', 'title', item.title)
  const payload = {
    type: 'Photo',
    title: item.title,
    file: item.fileId,
    fileType: 'image',
    order: item.order,
  }

  if (existing) {
    await request(`/media-gallery/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    bump('media-gallery', 'updated')
    return
  }

  await request('/media-gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  bump('media-gallery', 'created')
}

async function upsertVideoItem(item) {
  const existing = await findOne('media-gallery', 'videoUrl', item.videoUrl)
  const payload = {
    type: 'Video',
    title: item.title,
    thumbnail: item.thumbnailId,
    videoUrl: item.videoUrl,
    fileType: 'youtube',
    order: item.order,
  }

  if (existing) {
    await request(`/media-gallery/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    bump('media-gallery', 'updated')
    return
  }

  await request('/media-gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  bump('media-gallery', 'created')
}

function printSummary() {
  console.log('\nMigration summary')
  console.log('=================')

  for (const [collection, counts] of Object.entries(summary.collections)) {
    console.log(
      `${collection}: created=${counts.created} updated=${counts.updated} skipped=${counts.skipped}`,
    )
  }

  if (summary.failed.length) {
    console.log('\nFailures')
    console.log('--------')
    for (const failure of summary.failed) {
      console.log(`${failure.collection} :: ${failure.record} :: ${failure.reason}`)
    }
  } else {
    console.log('\nFailures')
    console.log('--------')
    console.log('None')
  }

  if (summary.unmatched.length) {
    console.log('\nSchema fields / collections without matching source data')
    console.log('-----------------------------------------------')
    for (const item of summary.unmatched) {
      console.log(`- ${item}`)
    }
  }

  if (summary.notes.length) {
    console.log('\nNotes')
    console.log('-----')
    for (const item of summary.notes) {
      console.log(`- ${item}`)
    }
  }
}

async function main() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Set them before running this script.`,
    )
  }

  console.log(`Using Payload API: ${API_URL}`)
  await login()
  console.log('Authenticated.')

  const [homePage, musicPage, videosPage, galleryPage, showsPage, solidarityPage, contactPage] =
    await Promise.all([
      fetchOldPage('/home'),
      fetchOldPage('/music'),
      fetchOldPage('/videos'),
      fetchOldPage('/gallery'),
      fetchOldPage('/shows'),
      fetchOldPage('/solidarity'),
      fetchOldPage('/contact'),
    ])

  const socials = extractSocialLinks(
    homePage.doc,
    musicPage.doc,
    videosPage.doc,
    galleryPage.doc,
    showsPage.doc,
    solidarityPage.doc,
    contactPage.doc,
  )
  const artist = extractArtistData(homePage, contactPage)
  const outsidersStreamUrl =
    [...homePage.doc.querySelectorAll('a[href]')]
      .map((anchor) => anchor.href)
      .find((href) => /streamlink\.to/i.test(href)) || ''
  const releases = await extractReleases(musicPage, solidarityPage, socials, outsidersStreamUrl)
  const videoIds = extractVideoIds(videosPage)
  const galleryImages = extractGalleryImages(galleryPage)

  try {
    const heroMedia = artist.heroImageUrl
      ? await uploadMediaFromUrl(artist.heroImageUrl, {
          alt: `${artist.name} hero image`,
          category: 'Artist',
        })
      : null
    artist.heroImageId = heroMedia?.id || null
  } catch (error) {
    pushFailure('media', 'artist hero image', error)
  }

  try {
    const portraitMedia = artist.portraitImageUrl
      ? await uploadMediaFromUrl(artist.portraitImageUrl, {
          alt: `${artist.name} portrait image`,
          category: 'Artist',
        })
      : null
    artist.portraitImageId = portraitMedia?.id || null
  } catch (error) {
    pushFailure('media', 'artist portrait image', error)
  }

  try {
    await upsertArtistProfile({
      ...artist,
      socials,
    })
  } catch (error) {
    pushFailure('artist-profile', artist.name, error)
  }

  for (const release of releases) {
    try {
      const coverMedia = await uploadMediaFromUrl(release.coverImageUrl, {
        alt: `${release.title} cover art`,
        category: 'Release Cover',
      })
      release.coverImageId = coverMedia.id
    } catch (error) {
      pushFailure('media', `${release.title} cover art`, error)
      continue
    }

    try {
      await upsertRelease(release)
    } catch (error) {
      pushFailure('releases', release.title, error)
    }
  }

  try {
    await normalizeFeaturedReleases(releases.map((release) => release.title))
  } catch (error) {
    pushFailure('releases', 'featured-release-normalization', error)
  }

  for (const [index, imageUrl] of galleryImages.entries()) {
    const filename = filenameFromUrl(imageUrl, `gallery-${String(index + 1).padStart(2, '0')}`)
    const title = `Gallery ${String(index + 1).padStart(2, '0')} - ${filename.replace(/\.[^.]+$/, '')}`

    try {
      const media = await uploadMediaFromUrl(imageUrl, {
        alt: `Poshbugati gallery photo ${index + 1}`,
        category: 'Press Photo',
        filename,
      })
      await upsertGalleryPhoto({
        title,
        fileId: media.id,
        order: index + 1,
      })
    } catch (error) {
      pushFailure('media-gallery', title, error)
    }
  }

  for (const [index, videoId] of videoIds.entries()) {
    const meta = await getYouTubeMeta(videoId, index)
    const thumbnailFilename = `${videoId}-hqdefault.jpg`

    try {
      const thumbnail = await uploadMediaFromUrl(meta.thumbnailUrl, {
        alt: `${meta.title} thumbnail`,
        category: 'Other',
        filename: thumbnailFilename,
      })
      await upsertVideoItem({
        title: meta.title,
        videoUrl: meta.videoUrl,
        thumbnailId: thumbnail.id,
        order: 100 + index + 1,
      })
    } catch (error) {
      pushFailure('media-gallery', meta.title, error)
    }
  }

  try {
    await updateSiteSettings({
      ...artist,
      featuredReleaseDate:
        releases.find((release) => release.title === 'Sweet Vibes EP')?.releaseDate || null,
    })
  } catch (error) {
    pushFailure('globals', 'site-settings', error)
  }

  summary.unmatched.push(
    'artist-profile.origin (no dedicated field in current schema; source context folded into tagline and bio)',
    'artist-profile.genre (no dedicated field in current schema; source context folded into tagline and bio)',
    'artist-profile.socialLinks.spotify (no dedicated field in current schema)',
    'artist-profile.socialLinks.appleMusic (no dedicated field in current schema)',
    'artist-profile.socialLinks.twitter (no dedicated field in current schema)',
    'artist-profile.whatsapp / phone (no dedicated field in current schema)',
    'releases.downloadUrl (no dedicated structured field; source mp3s mapped to tracks[].previewUrl and download links summarized in distributionTiers[].description)',
    'tour-shows collection (old /shows page did not expose structured event records)',
    'blog-posts collection',
    'podcast-episodes collection',
    'podcast-stats collection',
    'merch-products collection',
    'subscriptions collection',
    'contact-submissions collection',
    'orders collection',
    'navigation global (old-site paths do not map cleanly to the current frontend route structure without UI changes)',
  )

  summary.notes.push(
    'Release dates for Sweet Vibes EP, Colorado Girl, and Influencer Whoop Remix were inferred from dated source assets and neighboring release metadata because the old site did not expose explicit release-date fields.',
    `Extracted ${galleryImages.length} gallery images from /gallery.`,
    `Extracted ${videoIds.length} YouTube embeds from /videos.`,
  )

  printSummary()
}

main().catch((error) => {
  console.error('\nMigration failed to start or aborted early.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
