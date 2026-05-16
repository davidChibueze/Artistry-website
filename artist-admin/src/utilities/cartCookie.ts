import crypto from 'crypto'

export const CART_COOKIE = 'cart_id'
export const CUSTOMER_COOKIE = 'customer_token'

const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days
const CUSTOMER_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10 // 10 years

function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=')
    if (rawKey === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function getCartIdFromRequest(headers: Headers): string | null {
  return readCookie(headers.get('cookie'), CART_COOKIE)
}

export function getCustomerTokenFromRequest(headers: Headers): string | null {
  return readCookie(headers.get('cookie'), CUSTOMER_COOKIE)
}

export function generateCartId(): string {
  return crypto.randomUUID()
}

export function generateCustomerToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

function isSecureRequest(headers: Headers): boolean {
  const proto = headers.get('x-forwarded-proto') ?? ''
  if (proto.includes('https')) return true
  return process.env.NODE_ENV === 'production'
}

function buildCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  secure: boolean,
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function buildCartCookie(cartId: string, requestHeaders: Headers): string {
  return buildCookie(CART_COOKIE, cartId, CART_MAX_AGE_SECONDS, isSecureRequest(requestHeaders))
}

export function buildCustomerCookie(token: string, requestHeaders: Headers): string {
  return buildCookie(
    CUSTOMER_COOKIE,
    token,
    CUSTOMER_MAX_AGE_SECONDS,
    isSecureRequest(requestHeaders),
  )
}

export function buildClearCookie(name: string, requestHeaders: Headers): string {
  return buildCookie(name, '', 0, isSecureRequest(requestHeaders))
}

/**
 * Append one or more Set-Cookie headers to a Response. Used because Headers.set
 * would clobber any existing Set-Cookie value when multiple cookies are needed.
 */
export function withSetCookies(response: Response, cookies: string[]): Response {
  for (const cookie of cookies) {
    response.headers.append('set-cookie', cookie)
  }
  return response
}
