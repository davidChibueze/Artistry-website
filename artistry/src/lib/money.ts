export type SupportedCurrency = 'USD' | 'NGN'

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['USD', 'NGN']

const DEFAULT_LOCALE: Record<SupportedCurrency, string> = {
  USD: 'en-US',
  NGN: 'en-NG',
}

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as string[]).includes(value)
}

/**
 * Currency-correct money formatting using the runtime's Intl tables.
 * Always prefer this over string concatenation with a hardcoded symbol.
 */
export function formatMoney(
  amount: number,
  currency: SupportedCurrency,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale ?? DEFAULT_LOCALE[currency], {
    style: 'currency',
    currency,
  }).format(amount)
}

export function priceFor(
  source: { priceUSD?: number | null; priceNGN?: number | null },
  currency: SupportedCurrency,
): number {
  const value = currency === 'NGN' ? source.priceNGN : source.priceUSD
  return value ?? 0
}
