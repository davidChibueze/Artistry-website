'use client'

import React, { useEffect, useState } from 'react'

interface FxResponse {
  rate: number
  fetchedAt: string
}

const FxHint: React.FC = () => {
  const [data, setData] = useState<FxResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function load(force = false) {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin-fx/usd-to-ngn${force ? '?force=1' : ''}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const json = (await response.json()) as FxResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rate')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(false)
  }, [])

  const formattedRate = data
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.rate)
    : null

  return (
    <div
      style={{
        padding: '8px 12px',
        background: 'var(--theme-elevation-50, #f5f5f5)',
        border: '1px solid var(--theme-elevation-100, #e5e5e5)',
        borderRadius: '4px',
        fontSize: '13px',
        marginBottom: '12px',
      }}
    >
      <strong>FX hint (admin only — not used at checkout):</strong>{' '}
      {loading && <span>Loading…</span>}
      {!loading && data && (
        <>
          <span>
            1 USD ≈ {formattedRate} as of{' '}
            {new Date(data.fetchedAt).toLocaleString()}
          </span>{' '}
          <button
            type="button"
            onClick={() => void load(true)}
            style={{
              marginLeft: '8px',
              padding: '2px 8px',
              fontSize: '12px',
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </>
      )}
      {error && <span style={{ color: 'var(--theme-error-500, crimson)' }}>{error}</span>}
    </div>
  )
}

export default FxHint
