import { cookies, headers } from 'next/headers'

import { isSupportedCurrency, type SupportedCurrency } from './money'

const NG_COUNTRY_CODES = new Set(['NG'])

/**
 * Server-side counterpart to the admin's detectCurrency:
 * cookie > geo header > default USD. Reads request cookies/headers via Next 16 async APIs.
 */
export async function detectInitialCurrency(): Promise<SupportedCurrency> {
  const cookieStore = await cookies()
  const cookiePref = cookieStore.get('pref_currency')?.value
  if (isSupportedCurrency(cookiePref)) return cookiePref

  const headerStore = await headers()
  const country = (
    headerStore.get('x-vercel-ip-country') ||
    headerStore.get('cf-ipcountry') ||
    headerStore.get('x-country-code') ||
    ''
  ).toUpperCase()
  if (country && NG_COUNTRY_CODES.has(country)) return 'NGN'

  return 'USD'
}
