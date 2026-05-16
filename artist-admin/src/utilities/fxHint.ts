interface ExchangerateHostResponse {
  result: number
  rates?: { NGN?: number }
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
let cached: { rate: number; fetchedAt: number } | null = null

function getProviderUrl(): string {
  // exchangerate.host free tier; override via env for a different provider.
  return (
    process.env.FX_PROVIDER_URL ||
    'https://api.exchangerate.host/convert?from=USD&to=NGN'
  )
}

/**
 * Fetch today's USD→NGN rate. Cached in-memory for 24h. Used only by the
 * admin "suggest NGN price" button — never at checkout.
 */
export async function getUsdToNgnRate(force = false): Promise<{ rate: number; fetchedAt: number }> {
  const now = Date.now()
  if (!force && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached
  }

  const response = await fetch(getProviderUrl(), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`FX provider returned ${response.status}`)
  }
  const data = (await response.json()) as ExchangerateHostResponse
  const rate = typeof data.result === 'number' ? data.result : data.rates?.NGN
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error('FX provider returned an invalid rate')
  }
  cached = { rate, fetchedAt: now }
  return cached
}
