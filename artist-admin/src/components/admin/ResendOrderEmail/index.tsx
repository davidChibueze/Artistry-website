'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

const ORDER_TEMPLATES: { value: string; label: string }[] = [
  { value: 'order.paid', label: 'Payment received' },
  { value: 'order.fulfilled', label: 'Fulfilled' },
  { value: 'order.shipped', label: 'Shipped' },
  { value: 'order.refunded', label: 'Refunded' },
  { value: 'order.cancelled', label: 'Cancelled' },
]

const ResendOrderEmail: React.FC = () => {
  const { id } = useDocumentInfo()
  const [templateKey, setTemplateKey] = useState<string>(ORDER_TEMPLATES[0].value)
  const [status, setStatus] = useState<{ kind: 'idle' | 'sending' | 'done' | 'error'; message?: string }>({
    kind: 'idle',
  })

  async function send() {
    if (!id) {
      setStatus({ kind: 'error', message: 'Save the order first.' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const response = await fetch('/api/admin-email/resend-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: Number(id), templateKey }),
      })
      const json = (await response.json()) as { result?: { status?: string; error?: string }; error?: string }
      if (!response.ok) {
        setStatus({ kind: 'error', message: json.error ?? `HTTP ${response.status}` })
        return
      }
      const resultStatus = json.result?.status ?? 'unknown'
      setStatus({
        kind: resultStatus === 'sent' ? 'done' : 'error',
        message:
          resultStatus === 'sent'
            ? `Sent.`
            : json.result?.error ?? `Send returned status: ${resultStatus}`,
      })
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
      <strong>Resend transactional email</strong>
      <p style={{ margin: '4px 0 8px', fontSize: '12px', opacity: 0.8 }}>
        Manually fire an email template to the customer for this order. The send is recorded in
        EmailLogs.
      </p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '6px 8px',
            border: '1px solid var(--theme-elevation-150, #ccc)',
            borderRadius: '3px',
          }}
        >
          {ORDER_TEMPLATES.map((tpl) => (
            <option key={tpl.value} value={tpl.value}>
              {tpl.label}
            </option>
          ))}
        </select>
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
          {status.kind === 'sending' ? 'Sending…' : 'Send'}
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

export default ResendOrderEmail
