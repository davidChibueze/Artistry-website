'use client'

import React, { useState } from 'react'

export default function RequestForm() {
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !orderNumber) return
    setSubmitting(true)
    try {
      await fetch('/api/cms/orders/request-magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), orderNumber: orderNumber.trim() }),
      })
    } catch {
      // Endpoint always returns 200; network errors fall through to the same UI.
    } finally {
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: 12 }}>
          If we found a matching order, a link is on its way to your inbox.
        </p>
        <p style={{ opacity: 0.7 }}>The link expires in 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 4,
            padding: '10px 12px',
            color: 'inherit',
            fontSize: '0.95rem',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
          Order number (e.g. PB-2026-0001)
        </label>
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 4,
            padding: '10px 12px',
            color: 'inherit',
            fontSize: '0.95rem',
          }}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={submitting} style={{ marginTop: 8 }}>
        {submitting ? 'Sending…' : 'Email me a link'}
      </button>
      <p style={{ fontSize: '0.75rem', opacity: 0.6, textAlign: 'center', margin: 0 }}>
        We never reveal whether an order exists. If the details match, you&apos;ll get an email.
      </p>
    </form>
  )
}
