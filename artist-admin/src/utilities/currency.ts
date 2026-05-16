import type { PayloadRequest } from 'payload'

export type SupportedCurrency = 'USD' | 'NGN'

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['USD', 'NGN']

export const DEFAULT_CURRENCY: SupportedCurrency = 'USD'

export const PREF_CURRENCY_COOKIE = 'pref_currency'

const NG_COUNTRY_CODES = new Set(['NG'])

function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=')
    if (rawKey === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

function isSupported(value: string | null): value is SupportedCurrency {
  return value === 'USD' || value === 'NGN'
}

/**
 * Resolves the display currency for the incoming request.
 * Priority: explicit cookie > query string > geo header > default.
 */
export function detectCurrency(req: PayloadRequest | Request): SupportedCurrency {
  const headers = 'headers' in req ? req.headers : new Headers()
  const url = new URL((req as Request).url || (req as PayloadRequest).url || 'http://localhost')

  const cookiePref = readCookie(headers.get('cookie'), PREF_CURRENCY_COOKIE)
  if (isSupported(cookiePref)) return cookiePref

  const queryPref = url.searchParams.get('currency')?.toUpperCase() ?? null
  if (isSupported(queryPref)) return queryPref

  const country =
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    headers.get('x-country-code') ||
    ''
  if (country && NG_COUNTRY_CODES.has(country.toUpperCase())) return 'NGN'

  return DEFAULT_CURRENCY
}

/**
 * Build a Set-Cookie header that pins the user's currency preference for 1 year.
 */
export function buildCurrencyCookie(currency: SupportedCurrency): string {
  const oneYear = 60 * 60 * 24 * 365
  return `${PREF_CURRENCY_COOKIE}=${currency}; Path=/; Max-Age=${oneYear}; SameSite=Lax`
}

/**
 * Selects the right per-currency price field from a snapshot.
 * Throws if neither price is set — callers should treat as "not for sale".
 */
export function priceFor(
  source: { priceUSD?: number | null; priceNGN?: number | null },
  currency: SupportedCurrency,
): number {
  const value = currency === 'NGN' ? source.priceNGN : source.priceUSD
  if (value == null) {
    throw new Error(`No price set for currency ${currency}`)
  }
  return value
}

/**
 * Server-side money formatting that mirrors the storefront's Intl.NumberFormat usage.
 * Pass an explicit locale to match the page's locale; defaults are sensible for our two currencies.
 */
export function formatMoney(
  amount: number,
  currency: SupportedCurrency,
  locale?: string,
): string {
  const resolvedLocale = locale ?? (currency === 'NGN' ? 'en-NG' : 'en-US')
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency,
  }).format(amount)
}
