'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useCurrency } from './currency-context'
import type { SupportedCurrency } from './money'

export interface CartLine {
  lineId: string | null
  type: 'Track' | 'EP' | 'Merch'
  productId: string
  variantId?: string | null
  name: string
  variantLabel?: string | null
  sku?: string | null
  priceUSD: number
  priceNGN: number
  imageUrl?: string | null
  quantity: number
}

export interface PublicCart {
  cartId: string
  displayCurrency: SupportedCurrency
  customerEmail?: string | null
  items: CartLine[]
  itemCount: number
  subtotal: number
}

interface CartContextValue {
  cart: PublicCart | null
  loading: boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  refresh: () => Promise<void>
  addItem: (args: {
    type: 'Track' | 'EP' | 'Merch'
    productId: string | number
    variantId?: string | null
    quantity?: number
  }) => Promise<{ ok: boolean; error?: string }>
  updateQuantity: (lineId: string, quantity: number) => Promise<{ ok: boolean; error?: string }>
  removeItem: (lineId: string) => Promise<{ ok: boolean; error?: string }>
  setEmail: (email: string) => Promise<{ ok: boolean; error?: string }>
}

const CartContext = createContext<CartContextValue | null>(null)

async function jsonOrError(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function extractError(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'error' in body) {
    const e = (body as { error: unknown }).error
    if (typeof e === 'string') return e
  }
  return undefined
}

interface ProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: ProviderProps) {
  const { currency, setCurrency } = useCurrency()
  const [cart, setCart] = useState<PublicCart | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const initialFetchRan = useRef<boolean>(false)

  const fetchCart = useCallback(async () => {
    const response = await fetch('/api/cms/cart', { credentials: 'include' })
    const body = (await jsonOrError(response)) as { cart?: PublicCart } | null
    if (!response.ok || !body?.cart) return
    setCart(body.cart)
    // If the server's cart already has a currency preference, surface it to the UI.
    if (body.cart.displayCurrency !== currency) {
      // We don't roundtrip back through setCurrency to avoid POSTing — the
      // server already produced this currency.
    }
  }, [currency])

  useEffect(() => {
    if (initialFetchRan.current) return
    initialFetchRan.current = true
    void (async () => {
      try {
        await fetchCart()
      } finally {
        setLoading(false)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When the user changes currency via the toggle, the server cart's displayCurrency
  // also updates (the currency-context POSTs to /cart/currency); pull the fresh cart.
  useEffect(() => {
    if (loading) return
    if (cart && cart.displayCurrency === currency) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, loading])

  const addItem: CartContextValue['addItem'] = useCallback(async (args) => {
    const response = await fetch('/api/cms/cart/items', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    })
    const body = (await jsonOrError(response)) as { cart?: PublicCart } | null
    if (!response.ok || !body?.cart) {
      return { ok: false, error: extractError(body) ?? `HTTP ${response.status}` }
    }
    setCart(body.cart)
    setDrawerOpen(true)
    return { ok: true }
  }, [])

  const updateQuantity: CartContextValue['updateQuantity'] = useCallback(async (lineId, quantity) => {
    const response = await fetch('/api/cms/cart/items', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lineId, quantity }),
    })
    const body = (await jsonOrError(response)) as { cart?: PublicCart } | null
    if (!response.ok || !body?.cart) {
      return { ok: false, error: extractError(body) ?? `HTTP ${response.status}` }
    }
    setCart(body.cart)
    return { ok: true }
  }, [])

  const removeItem: CartContextValue['removeItem'] = useCallback(async (lineId) => {
    const response = await fetch(`/api/cms/cart/items?lineId=${encodeURIComponent(lineId)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const body = (await jsonOrError(response)) as { cart?: PublicCart } | null
    if (!response.ok || !body?.cart) {
      return { ok: false, error: extractError(body) ?? `HTTP ${response.status}` }
    }
    setCart(body.cart)
    return { ok: true }
  }, [])

  const setEmail: CartContextValue['setEmail'] = useCallback(async (email) => {
    const response = await fetch('/api/cms/cart/email', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const body = (await jsonOrError(response)) as { cart?: PublicCart } | null
    if (!response.ok || !body?.cart) {
      return { ok: false, error: extractError(body) ?? `HTTP ${response.status}` }
    }
    setCart(body.cart)
    return { ok: true }
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      refresh: fetchCart,
      addItem,
      updateQuantity,
      removeItem,
      setEmail,
    }),
    [cart, loading, drawerOpen, fetchCart, addItem, updateQuantity, removeItem, setEmail],
  )

  // Re-export setCurrency from CurrencyContext indirectly — components inside
  // CartProvider may also call useCurrency() directly if they need it.
  void setCurrency

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
