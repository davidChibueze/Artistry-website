'use client'

import React from 'react'

import { CartProvider } from '@/lib/cart-context'
import { CurrencyProvider } from '@/lib/currency-context'
import type { SupportedCurrency } from '@/lib/money'

interface Props {
  initialCurrency: SupportedCurrency
  children: React.ReactNode
}

export default function Providers({ initialCurrency, children }: Props) {
  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      <CartProvider>{children}</CartProvider>
    </CurrencyProvider>
  )
}
