import crypto from 'crypto'

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 // 24h

function getSecret(): string {
  const value = process.env.PAYLOAD_SECRET
  if (!value) throw new Error('PAYLOAD_SECRET is not set')
  return value
}

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4)
  return Buffer.from(padded, 'base64')
}

function sign(payload: string): Buffer {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest()
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export interface MagicLinkPayload {
  orderId: number
  expiresAt: number
}

export function signMagicLink(orderId: number, ttlSeconds: number = DEFAULT_TTL_SECONDS): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${orderId}.${expiresAt}`
  const sig = base64UrlEncode(sign(payload))
  return `${base64UrlEncode(payload)}.${sig}`
}

export function verifyMagicLink(token: string): MagicLinkPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [encodedPayload, providedSig] = parts

  let payload: string
  try {
    payload = base64UrlDecode(encodedPayload).toString('utf8')
  } catch {
    return null
  }

  const expectedSig = sign(payload)
  let providedSigBuf: Buffer
  try {
    providedSigBuf = base64UrlDecode(providedSig)
  } catch {
    return null
  }
  if (!timingSafeEqual(expectedSig, providedSigBuf)) return null

  const [orderIdStr, expiresAtStr] = payload.split('.')
  const orderId = Number(orderIdStr)
  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(orderId) || !Number.isFinite(expiresAt)) return null
  if (expiresAt * 1000 < Date.now()) return null

  return { orderId, expiresAt }
}

export function describeTtl(ttlSeconds: number = DEFAULT_TTL_SECONDS): string {
  if (ttlSeconds % 3600 === 0) {
    const h = ttlSeconds / 3600
    return h === 1 ? '1 hour' : `${h} hours`
  }
  const m = Math.round(ttlSeconds / 60)
  return `${m} minutes`
}
