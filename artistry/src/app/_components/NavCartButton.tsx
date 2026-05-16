'use client'

import { ShoppingBag } from 'lucide-react'
import React from 'react'

import { useCart } from '@/lib/cart-context'

import styles from './NavCartButton.module.css'

export default function NavCartButton() {
  const { cart, openDrawer } = useCart()
  const count = cart?.itemCount ?? 0

  return (
    <button
      type="button"
      className={styles.cartBtn}
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      onClick={openDrawer}
    >
      <ShoppingBag size={20} aria-hidden="true" />
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  )
}
