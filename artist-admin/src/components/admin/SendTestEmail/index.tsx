'use client'

import React, { useState } from 'react'
import { useAllFormFields, useAuth } from '@payloadcms/ui'

const SendTestEmail: React.FC = () => {
  const { user } = useAuth()
  const [fields] = useAllFormFields()
  const [to, setTo] = useState<string>('')
  const [status, setStatus] = useState<{ kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({
    kind: 'idle',
  })

  const templateKey = (fields?.key?.value as string | undefined) ?? ''
  const defaultTo = (user as { email?: string } | null | undefined)?.email ?? ''
  const targetTo = (to || defaultTo).trim()

  async function send() {
    if (!templateKey) {
      setStatus({ kind: 'error', message: 'Save the template first so a key is set.' })
      return
    }
    if (!targetTo) {
      setStatus({ kind: 'error', message: 'No recipient email available.' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const response = await fetch('/api/admin-email/test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ templateKey, to: targetTo }),
      })
      const json = (await response.json()) as { result?: { status?: string; error?: string }; error?: string }
      if (!response.ok) {
        setStatus({ kind: 'error', message: json.error ?? `HTTP ${response.status}` })
        return
      }
      const resultStatus = json.result?.status ?? 'unknown'
      if (resultStatus === 'sent') {
        setStatus({ kind: 'sent', message: `Sent to ${targetTo}` })
      } else {
        setStatus({ kind: 'error', message: json.result?.error ?? `Send returned status: ${resultStatus}` })
      }
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return (
    <div
      style={{
        padding: '12px',
        background: 'var(--theme-elevation-50, #f5f5f5)',
        border: '1px solid var(--theme-elevation-100, #e5e5e5)',
        borderRadius: '4px',
        marginBottom: '16px',
      }}
    >
      <strong>Send test</strong>
      <p style={{ margin: '4px 0 8px', fontSize: '12px', opacity: 0.8 }}>
        Renders this template with sample variables and emails it to the address below.
      </p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={to}
          placeholder={defaultTo || 'you@example.com'}
          onChange={(e) => setTo(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '6px 8px',
            border: '1px solid var(--theme-elevation-150, #ccc)',
            borderRadius: '3px',
          }}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={status.kind === 'sending'}
          style={{
            padding: '6px 14px',
            background: 'var(--theme-success-500, #2c7a4a)',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: status.kind === 'sending' ? 'wait' : 'pointer',
          }}
        >
          {status.kind === 'sending' ? 'Sending…' : 'Send test'}
        </button>
      </div>
      {status.message && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '12px',
            color:
              status.kind === 'error'
                ? 'var(--theme-error-500, crimson)'
                : 'var(--theme-success-500, #2c7a4a)',
          }}
        >
          {status.message}
        </p>
      )}
    </div>
  )
}

export default SendTestEmail
