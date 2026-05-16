'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { isSupportedCurrency, type SupportedCurrency } from './money'

interface CurrencyContextValue {
  currency: SupportedCurrency
  setCurrency: (next: SupportedCurrency) => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

interface ProviderProps {
  initialCurrency: SupportedCurrency
  children: React.ReactNode
}

export function CurrencyProvider({ initialCurrency, children }: ProviderProps) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(initialCurrency)

  const setCurrency = useCallback(async (next: SupportedCurrency) => {
    if (!isSupportedCurrency(next)) return
    setCurrencyState(next)
    try {
      await fetch('/api/cms/cart/currency', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currency: next }),
      })
    } catch {
      // Currency preference is also stored in a cookie by the server; client
      // state is the source of truth for the current session anyway.
    }
  }, [])

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
