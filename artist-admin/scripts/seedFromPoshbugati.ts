import 'dotenv/config'
import path from 'path'
import { Buffer } from 'buffer'
import { JSDOM, VirtualConsole } from 'jsdom'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config'

const OLD_SITE_ORIGIN = 'https://poshbugati.com'

const TRACK_DATE_HINTS: Record<string, string> = {
  'Sweet Vibes EP': '2021-09-08',
  'Colorado Girl': '2021-09-08',
  'Influencer Whoop Remix': '2022-12-08',
}

const RELEASE_DESCRIPTION_HINTS: Record<string, string> = {
  'Sweet Vibes EP': 'Six-track EP migrated from the original poshbugati.com catalog.',
  Outsiders: 'Single migrated from the original poshbugati.com catalog.',
  'Influencer Whoop Remix': 'Afro-dancehall single migrated from the original poshbugati.com catalog.',
  Aje: 'Single migrated from the original poshbugati.com catalog.',
  'Colorado Girl': 'Single migrated from the original poshbugati.com catalog.',
  'No Fight': 'Single migrated from the original poshbugati.com catalog.',
  Solidarity: 'Call-for-unity single migrated from the original poshbugati.com catalog.',
}

const virtualConsole = new VirtualConsole()
virtualConsole.on('error', () => {})
virtualConsole.on('warn', () => {})

interface SeedSummary {
  collections: Record<string, { created: number; updated: number; skipped: number }>
  failed: { collection: string; record: string; reason: string }[]
  notes: string[]
}

function createSummary(): SeedSummary {
  return {
    collections: {
      media: { created: 0, updated: 0, skipped: 0 },
      'artist-profile': { created: 0, updated: 0, skipped: 0 },
      releases: { created: 0, updated: 0, skipped: 0 },
      'media-gallery': { created: 0, updated: 0, skipped: 0 },
      globals: { created: 0, updated: 0, skipped: 0 },
    },
    failed: [],
    notes: [],
  }
}

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeText(value: string | null | undefined): string {
  return String(value || '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values.filter(Boolean))]
}

function makeRichText(paragraphs: string[]) {
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

function createDocument(html: string, url: string): Document {
  return new JSDOM(html, { url, virtualConsole }).window.document
}

function toAbsoluteUrl(value: string | null | undefined, origin = OLD_SITE_ORIGIN): string {
  if (!value) return ''
  const input = String(value).trim()
  if (!input) return ''
  if (input.startsWith('//')) return `https:${input}`
  if (/^https?:\/\//i.test(input)) return input
  return new URL(input, origin).href
}

function toOriginalAssetUrl(value: string | null | undefined): string {
  const absolute = toAbsoluteUrl(value)
  if (!absolute) return ''
  return absolute.split('/!!/')[0]
}

function sanitizeFilename(value: string): string {
  return String(value || 'file')
    .replace(/[?#].*$/, '')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function guessExtensionFromContentType(contentType: string): string {
  if (!contentType) return ''
  if (contentType.includes('jpeg')) return '.jpg'
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('gif')) return '.gif'
  if (contentType.includes('svg')) return '.svg'
  if (contentType.includes('mpeg')) return '.mp3'
  if (contentType.includes('wav')) return '.wav'
  return ''
}

function filenameFromUrl(value: string, fallbackBase = 'file'): string {
  const url = new URL(value)
  const pathname = url.pathname.split('/!!/')[0]
  let name = decodeURIComponent(path.basename(pathname))
  if (!name || name === '/') {
    const ext = guessExtensionFromContentType(url.searchParams.get('contentType') || '')
    name = `${fallbackBase}${ext}`
  }
  return sanitizeFilename(name)
}

function pushFailure(summary: SeedSummary, collection: string, record: string, error: unknown) {
  summary.failed.push({
    collection,
    record,
    reason: error instanceof Error ? error.message : String(error),
  })
}

function bump(summary: SeedSummary, collection: string, action: 'created' | 'updated' | 'skipped') {
  if (!summary.collections[collection]) {
    summary.collections[collection] = { created: 0, updated: 0, skipped: 0 }
  }
  summary.collections[collection][action] += 1
}

interface FetchedPage {
  route: string
  url: string
  html: string
  doc: Document
}

async function fetchOldPage(route: string): Promise<FetchedPage> {
  const url = toAbsoluteUrl(route, OLD_SITE_ORIGIN)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  const html = await response.text()
  return { route, url, html, doc: createDocument(html, url) }
}

function extractJsonLdSameAs(doc: Document): string[] {
  const urls: string[] = []
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

interface Socials {
  instagram: string
  spotify: string
  appleMusic: string
  youtube: string
  twitter: string
  tiktok: string
}

function extractSocialLinks(...docs: Document[]): Socials {
  const urls = unique(
    docs.flatMap((doc) => [
      ...[...doc.querySelectorAll('a[href]')].map((anchor) => (anchor as HTMLAnchorElement).href),
      ...extractJsonLdSameAs(doc),
    ]),
  )

  const getMatch = (pattern: RegExp) => urls.find((url) => pattern.test(url)) || ''

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

interface ArtistData {
  name: string
  tagline: string
  bioParagraphs: string[]
  homeDescription: string
  heroImageUrl: string
  portraitImageUrl: string
  generalEmail: string
  whatsapp: string
  heroImageId?: number | null
  portraitImageId?: number | null
}

function extractArtistData(homePage: FetchedPage, contactPage: FetchedPage): ArtistData {
  const bodyText = normalizeText(homePage.doc.body.textContent)
  const aboutMatch = bodyText.match(/ABOUT\s+(.+?)\s+NEW POSHBUGATI RELEASES/i)
  const candidateParagraphs = [
    aboutMatch?.[1],
    ...[...homePage.doc.querySelectorAll('p')]
      .map((node) => normalizeText(node.textContent))
      .filter((text) => text.length > 80),
  ].filter((p): p is string => Boolean(p))

  const bioParagraphs = unique(
    candidateParagraphs.filter((text) =>
      /Emmanuel George Akpose|The now Miami|With two mammoth singles|With his flexible/i.test(text),
    ),
  )

  const images = [...homePage.doc.querySelectorAll('img[src]')]
    .map((img) => toOriginalAssetUrl(img.getAttribute('src')))
    .filter(Boolean)

  const homeDescription =
    homePage.doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  const generalEmail =
    contactPage.doc
      .querySelector('a[href^="mailto:"]')
      ?.getAttribute('href')
      ?.replace(/^mailto:/, '') || ''
  const whatsapp =
    contactPage.doc.querySelector('a[href*="wa.me"], a[href*="whatsapp"]')?.getAttribute('href') || ''

  return {
    name: normalizeText(homePage.doc.querySelector('h1')?.textContent) || 'Poshbugati',
    tagline: 'Afro-pop artist from Jos Plateau, Nigeria',
    bioParagraphs: bioParagraphs.length ? bioParagraphs : ['Afro country artist from Jos Plateau, Nigeria.'],
    homeDescription: normalizeText(homeDescription),
    heroImageUrl: images[0] || '',
    portraitImageUrl: images[1] || images[0] || '',
    generalEmail,
    whatsapp: toAbsoluteUrl(whatsapp),
  }
}

async function getTrackPageMeta(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch track page ${url}: ${response.status} ${response.statusText}`)
  }
  const html = await response.text()
  const doc = createDocument(html, url)
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || ''
  const dateMatch = html.match(/\b20\d{2}-\d{2}-\d{2}\b/)
  const mp3Match = html.match(/\/player\/tracks\/\d+\.mp3(?:\?[^"'\s<]+)?/)

  return {
    description,
    date: dateMatch ? dateMatch[0] : '',
    previewUrl: mp3Match ? toAbsoluteUrl(mp3Match[0], OLD_SITE_ORIGIN) : '',
  }
}

interface ExtractedTrack {
  number: number
  title: string
  subtitle?: string
  duration?: string
  badge?: string
  previewUrl?: string
}

interface ExtractedDistributionTier {
  label: string
  description?: string
  priceUSD: number
  priceNGN: number
}

interface ExtractedRelease {
  title: string
  slug: string
  type: 'EP' | 'Single' | 'Album'
  coverImageUrl: string
  coverImageId?: number | null
  releaseDate?: string
  description: string
  featured: boolean
  tracks: ExtractedTrack[]
  streamUrl?: string
  distributionTiers: ExtractedDistributionTier[]
}

async function extractReleases(
  musicPage: FetchedPage,
  solidarityPage: FetchedPage,
  outsidersStreamUrl: string,
  summary: SeedSummary,
): Promise<ExtractedRelease[]> {
  const pages = [musicPage.doc, solidarityPage.doc]
  const releaseMap = new Map<string, ExtractedRelease>()

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
      const tracks: ExtractedTrack[] = []
      const trackMetas: { description: string; date: string; previewUrl: string }[] = []
      const trackDescriptions: string[] = []

      for (const [index, row] of rowNodes.entries()) {
        const trackNumber = Number.parseInt(
          normalizeText(row.querySelector('.track-number')?.textContent),
          10,
        )
        const titleNode = row.querySelector(
          '.track-title .title, .track-title .text-main, .text-main .title',
        )
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

        let trackPageMeta = { description: '', date: '', previewUrl: '' }
        if (trackUrl) {
          try {
            trackPageMeta = await getTrackPageMeta(trackUrl)
          } catch (error) {
            pushFailure(summary, 'releases', `${title} > ${trackTitle || `Track ${index + 1}`}`, error)
          }
        }

        trackMetas.push(trackPageMeta)
        if (trackPageMeta.description) trackDescriptions.push(trackPageMeta.description)

        tracks.push({
          number: Number.isFinite(trackNumber) ? trackNumber : index + 1,
          title: trackTitle || `Track ${index + 1}`,
          subtitle: 'Afro-pop',
          duration: duration || undefined,
          badge: rowNodes.length === 1 ? 'Single' : undefined,
          previewUrl: previewUrl || trackPageMeta.previewUrl || undefined,
        })
      }

      const releaseType: ExtractedRelease['type'] = /EP$/i.test(title) ? 'EP' : 'Single'
      const downloadHref =
        article.querySelector('.album-download a.download')?.getAttribute('href') || ''
      const downloadUrl =
        downloadHref && downloadHref !== '#' ? toAbsoluteUrl(downloadHref, OLD_SITE_ORIGIN) : ''
      const rawPrice = Number.parseFloat(
        article.querySelector('.album-download form[data-min-price]')?.getAttribute('data-min-price') ||
          article.querySelector('form[data-min-price]')?.getAttribute('data-min-price') ||
          '',
      )
      const pageDescription =
        trackDescriptions.find((desc) => !/ by Poshbugati$/i.test(desc)) || ''

      const releaseDate =
        trackMetas.map((meta) => meta.date).find(Boolean) || TRACK_DATE_HINTS[title] || ''

      const distributionTiers: ExtractedDistributionTier[] = []
      const priceUSD = Number.isFinite(rawPrice) ? rawPrice : 0
      if (priceUSD > 0 || downloadUrl) {
        distributionTiers.push({
          label: releaseType === 'EP' ? 'Digital EP Download' : 'Digital Download',
          description: downloadUrl
            ? `Original download link: ${downloadUrl}`
            : 'Original minimum-price download on poshbugati.com',
          priceUSD: priceUSD || 0,
          priceNGN: 0,
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
        tracks,
        streamUrl: title === 'Outsiders' && outsidersStreamUrl ? outsidersStreamUrl : undefined,
        distributionTiers,
      })
    }
  }

  return [...releaseMap.values()]
}

function extractVideoIds(videosPage: FetchedPage): string[] {
  const html = videosPage.html
  return unique([...html.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)].map((m) => m[1]))
}

async function getYouTubeMeta(videoId: string, index: number) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`

  try {
    const response = await fetch(oembedUrl)
    if (!response.ok) throw new Error(`oEmbed ${response.status}`)
    const payload = (await response.json()) as { title?: string }
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

function extractGalleryImages(galleryPage: FetchedPage): string[] {
  return unique(
    [
      ...galleryPage.doc.querySelectorAll(
        '.gallery-item a[href], a.gallery-item[href], a[href*="images.zoogletools.com"]',
      ),
    ]
      .map((anchor) => toOriginalAssetUrl(anchor.getAttribute('href')))
      .filter((href) => /\.(jpe?g|png|gif|webp)$/i.test(href)),
  )
}

async function findOne(
  payload: Payload,
  collection: string,
  field: string,
  value: string,
): Promise<{ id: number } | null> {
  const result = await payload.find({
    collection: collection as Parameters<typeof payload.find>[0]['collection'],
    where: { [field]: { equals: value } },
    limit: 1,
    overrideAccess: true,
  })
  return (result.docs[0] as { id: number } | undefined) ?? null
}

async function uploadMediaFromUrl(
  payload: Payload,
  summary: SeedSummary,
  sourceUrl: string,
  metadata: { alt?: string; caption?: string; category?: string; filename?: string },
): Promise<{ id: number } | null> {
  if (!sourceUrl) throw new Error('Missing source URL for media upload.')
  const filename = metadata.filename || filenameFromUrl(sourceUrl, slugify(metadata.alt || 'media'))

  const existing = await findOne(payload, 'media', 'filename', filename)
  if (existing) {
    bump(summary, 'media', 'skipped')
    return existing
  }

  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to download media ${sourceUrl}: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream'
  const buffer = Buffer.from(await response.arrayBuffer())

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: metadata.alt || '',
      caption: metadata.caption || '',
      category: (metadata.category || 'Other') as 'Other',
    } as Parameters<typeof payload.create<'media'>>[0]['data'],
    file: {
      data: buffer,
      mimetype: contentType,
      name: filename,
      size: buffer.length,
    },
    overrideAccess: true,
  })

  bump(summary, 'media', 'created')
  return created as { id: number }
}

async function upsertArtistProfile(
  payload: Payload,
  summary: SeedSummary,
  data: ArtistData & { socials: Socials },
) {
  const existingResult = await payload.find({
    collection: 'artist-profile',
    limit: 1,
    overrideAccess: true,
  })
  const existing = existingResult.docs[0] as { id: number } | undefined

  const docData = {
    name: data.name,
    tagline: data.tagline,
    bio: makeRichText(data.bioParagraphs),
    heroImage: data.heroImageId ?? null,
    portraitImage: data.portraitImageId ?? null,
    principles: [],
    timeline: [],
    pressQuotes: [],
    socialLinks: {
      instagram: data.socials.instagram || '',
      tiktok: data.socials.tiktok || '',
      youtube: data.socials.youtube || '',
      soundcloud: '',
      linktree: '',
      streamUrl: '',
    },
    contactEmails: {
      general: data.generalEmail || '',
      booking: '',
      press: '',
    },
  }

  if (existing) {
    await payload.update({
      collection: 'artist-profile',
      id: existing.id,
      data: docData as Parameters<typeof payload.update<'artist-profile'>>[0]['data'],
      overrideAccess: true,
    })
    bump(summary, 'artist-profile', 'updated')
    return
  }

  await payload.create({
    collection: 'artist-profile',
    data: docData as Parameters<typeof payload.create<'artist-profile'>>[0]['data'],
    overrideAccess: true,
  })
  bump(summary, 'artist-profile', 'created')
}

async function updateSiteSettings(
  payload: Payload,
  summary: SeedSummary,
  data: ArtistData & { featuredReleaseDate: string | null },
) {
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteTitle: data.name,
      siteDescription: data.homeDescription || data.bioParagraphs[0] || '',
      ogImage: data.heroImageId ?? null,
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
    } as Parameters<typeof payload.updateGlobal<'site-settings'>>[0]['data'],
    overrideAccess: true,
  })
  bump(summary, 'globals', 'updated')
}

function buildReleasePayload(release: ExtractedRelease) {
  return {
    title: release.title,
    slug: release.slug,
    type: release.type,
    coverImage: release.coverImageId ?? null,
    releaseDate: release.releaseDate || undefined,
    description: release.description || undefined,
    featured: Boolean(release.featured),
    streamUrl: release.streamUrl || undefined,
    tracks: release.tracks.map((track) => ({
      number: track.number,
      title: track.title,
      subtitle: track.subtitle || undefined,
      duration: track.duration || undefined,
      badge: track.badge || undefined,
      previewUrl: track.previewUrl || undefined,
    })),
    distributionTiers: release.distributionTiers.map((tier) => ({
      label: tier.label,
      description: tier.description || undefined,
      priceUSD: tier.priceUSD ?? 0,
      priceNGN: tier.priceNGN ?? 0,
    })),
  }
}

async function upsertRelease(payload: Payload, summary: SeedSummary, release: ExtractedRelease) {
  const existing = await findOne(payload, 'releases', 'title', release.title)
  const docData = buildReleasePayload(release)
  if (existing) {
    await payload.update({
      collection: 'releases',
      id: existing.id,
      data: docData as Parameters<typeof payload.update<'releases'>>[0]['data'],
      overrideAccess: true,
    })
    bump(summary, 'releases', 'updated')
    return
  }
  await payload.create({
    collection: 'releases',
    data: docData as Parameters<typeof payload.create<'releases'>>[0]['data'],
    overrideAccess: true,
  })
  bump(summary, 'releases', 'created')
}

async function upsertGalleryPhoto(
  payload: Payload,
  summary: SeedSummary,
  item: { title: string; fileId: number; order: number },
) {
  const existing = await findOne(payload, 'media-gallery', 'title', item.title)
  const data = {
    type: 'Photo' as const,
    title: item.title,
    file: item.fileId,
    fileType: 'image' as const,
    order: item.order,
  }
  if (existing) {
    await payload.update({
      collection: 'media-gallery',
      id: existing.id,
      data: data as Parameters<typeof payload.update<'media-gallery'>>[0]['data'],
      overrideAccess: true,
    })
    bump(summary, 'media-gallery', 'updated')
    return
  }
  await payload.create({
    collection: 'media-gallery',
    data: data as Parameters<typeof payload.create<'media-gallery'>>[0]['data'],
    overrideAccess: true,
  })
  bump(summary, 'media-gallery', 'created')
}

async function upsertVideoItem(
  payload: Payload,
  summary: SeedSummary,
  item: { title: string; videoUrl: string; thumbnailId: number; order: number },
) {
  const existing = await findOne(payload, 'media-gallery', 'videoUrl', item.videoUrl)
  const data = {
    type: 'Video' as const,
    title: item.title,
    thumbnail: item.thumbnailId,
    videoUrl: item.videoUrl,
    fileType: 'youtube' as const,
    order: item.order,
  }
  if (existing) {
    await payload.update({
      collection: 'media-gallery',
      id: existing.id,
      data: data as Parameters<typeof payload.update<'media-gallery'>>[0]['data'],
      overrideAccess: true,
    })
    bump(summary, 'media-gallery', 'updated')
    return
  }
  await payload.create({
    collection: 'media-gallery',
    data: data as Parameters<typeof payload.create<'media-gallery'>>[0]['data'],
    overrideAccess: true,
  })
  bump(summary, 'media-gallery', 'created')
}

async function normalizeFeaturedReleases(
  payload: Payload,
  summary: SeedSummary,
  migratedTitles: string[],
) {
  const response = await payload.find({
    collection: 'releases',
    where: { featured: { equals: true } },
    limit: 100,
    overrideAccess: true,
  })
  for (const doc of response.docs) {
    const typedDoc = doc as { id: number; title?: string }
    if (typedDoc.title === 'Sweet Vibes EP') continue
    if (typedDoc.title && migratedTitles.includes(typedDoc.title)) continue
    try {
      await payload.update({
        collection: 'releases',
        id: typedDoc.id,
        data: { featured: false },
        overrideAccess: true,
      })
      bump(summary, 'releases', 'updated')
    } catch (error) {
      pushFailure(summary, 'releases', typedDoc.title || `release:${typedDoc.id}`, error)
    }
  }
}

function printSummary(summary: SeedSummary) {
  console.log('\nPoshbugati seed summary')
  console.log('=======================')
  for (const [collection, counts] of Object.entries(summary.collections)) {
    console.log(
      `${collection}: created=${counts.created} updated=${counts.updated} skipped=${counts.skipped}`,
    )
  }
  if (summary.failed.length) {
    console.log('\nFailures')
    for (const failure of summary.failed) {
      console.log(`${failure.collection} :: ${failure.record} :: ${failure.reason}`)
    }
  }
  if (summary.notes.length) {
    console.log('\nNotes')
    for (const note of summary.notes) console.log(`- ${note}`)
  }
}

export async function seedFromPoshbugati(payloadInstance?: Payload): Promise<void> {
  const payload = payloadInstance ?? (await getPayload({ config }))
  const summary = createSummary()

  console.log('Pulling content from poshbugati.com…')

  let homePage: FetchedPage
  let musicPage: FetchedPage
  let videosPage: FetchedPage
  let galleryPage: FetchedPage
  let solidarityPage: FetchedPage
  let contactPage: FetchedPage

  try {
    ;[homePage, musicPage, videosPage, galleryPage, solidarityPage, contactPage] = await Promise.all([
      fetchOldPage('/home'),
      fetchOldPage('/music'),
      fetchOldPage('/videos'),
      fetchOldPage('/gallery'),
      fetchOldPage('/solidarity'),
      fetchOldPage('/contact'),
    ])
  } catch (error) {
    console.warn(
      'Could not reach poshbugati.com — skipping the old-site content seed. Reason:',
      error instanceof Error ? error.message : error,
    )
    return
  }

  const socials = extractSocialLinks(
    homePage.doc,
    musicPage.doc,
    videosPage.doc,
    galleryPage.doc,
    solidarityPage.doc,
    contactPage.doc,
  )
  const artist = extractArtistData(homePage, contactPage)
  const outsidersStreamUrl =
    [...homePage.doc.querySelectorAll('a[href]')]
      .map((anchor) => (anchor as HTMLAnchorElement).href)
      .find((href) => /streamlink\.to/i.test(href)) || ''

  const releases = await extractReleases(musicPage, solidarityPage, outsidersStreamUrl, summary)
  const videoIds = extractVideoIds(videosPage)
  const galleryImages = extractGalleryImages(galleryPage)

  try {
    if (artist.heroImageUrl) {
      const heroMedia = await uploadMediaFromUrl(payload, summary, artist.heroImageUrl, {
        alt: `${artist.name} hero image`,
        category: 'Artist',
      })
      artist.heroImageId = heroMedia?.id ?? null
    }
  } catch (error) {
    pushFailure(summary, 'media', 'artist hero image', error)
  }

  try {
    if (artist.portraitImageUrl) {
      const portraitMedia = await uploadMediaFromUrl(payload, summary, artist.portraitImageUrl, {
        alt: `${artist.name} portrait image`,
        category: 'Artist',
      })
      artist.portraitImageId = portraitMedia?.id ?? null
    }
  } catch (error) {
    pushFailure(summary, 'media', 'artist portrait image', error)
  }

  try {
    await upsertArtistProfile(payload, summary, { ...artist, socials })
  } catch (error) {
    pushFailure(summary, 'artist-profile', artist.name, error)
  }

  for (const release of releases) {
    try {
      const coverMedia = await uploadMediaFromUrl(payload, summary, release.coverImageUrl, {
        alt: `${release.title} cover art`,
        category: 'Release Cover',
      })
      release.coverImageId = coverMedia?.id ?? null
    } catch (error) {
      pushFailure(summary, 'media', `${release.title} cover art`, error)
      release.coverImageId = null
    }

    try {
      await upsertRelease(payload, summary, release)
    } catch (error) {
      pushFailure(summary, 'releases', release.title, error)
    }
  }

  try {
    await normalizeFeaturedReleases(payload, summary, releases.map((r) => r.title))
  } catch (error) {
    pushFailure(summary, 'releases', 'featured-release-normalization', error)
  }

  for (const [index, imageUrl] of galleryImages.entries()) {
    const filename = filenameFromUrl(imageUrl, `gallery-${String(index + 1).padStart(2, '0')}`)
    const title = `Gallery ${String(index + 1).padStart(2, '0')} - ${filename.replace(/\.[^.]+$/, '')}`
    try {
      const media = await uploadMediaFromUrl(payload, summary, imageUrl, {
        alt: `Poshbugati gallery photo ${index + 1}`,
        category: 'Press Photo',
        filename,
      })
      if (media) {
        await upsertGalleryPhoto(payload, summary, {
          title,
          fileId: media.id,
          order: index + 1,
        })
      }
    } catch (error) {
      pushFailure(summary, 'media-gallery', title, error)
    }
  }

  for (const [index, videoId] of videoIds.entries()) {
    const meta = await getYouTubeMeta(videoId, index)
    const thumbnailFilename = `${videoId}-hqdefault.jpg`
    try {
      const thumbnail = await uploadMediaFromUrl(payload, summary, meta.thumbnailUrl, {
        alt: `${meta.title} thumbnail`,
        category: 'Other',
        filename: thumbnailFilename,
      })
      if (thumbnail) {
        await upsertVideoItem(payload, summary, {
          title: meta.title,
          videoUrl: meta.videoUrl,
          thumbnailId: thumbnail.id,
          order: 100 + index + 1,
        })
      }
    } catch (error) {
      pushFailure(summary, 'media-gallery', meta.title, error)
    }
  }

  try {
    await updateSiteSettings(payload, summary, {
      ...artist,
      featuredReleaseDate:
        releases.find((release) => release.title === 'Sweet Vibes EP')?.releaseDate || null,
    })
  } catch (error) {
    pushFailure(summary, 'globals', 'site-settings', error)
  }

  summary.notes.push(
    `Extracted ${galleryImages.length} gallery images, ${videoIds.length} videos, ${releases.length} releases.`,
    'priceNGN was set to 0 on every distributionTier — fill these in manually for NGN customers.',
  )

  printSummary(summary)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedFromPoshbugati()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Poshbugati seed failed:', error)
      process.exit(1)
    })
}
