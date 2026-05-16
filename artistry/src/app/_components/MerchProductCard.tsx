'use client'

import React, { useMemo, useState } from 'react'

import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import { formatMoney, priceFor } from '@/lib/money'
import { getMediaUrl } from '@/lib/api'
import type { MerchProduct } from '@/payload-types'

import styles from './MerchProductCard.module.css'

type Variant = NonNullable<MerchProduct['variants']>[number]

function productImageUrl(product: MerchProduct): string {
  return getMediaUrl(product.images?.[0]?.image)
}

function variantImageUrl(variant: Variant | undefined): string {
  if (!variant?.image) return ''
  return getMediaUrl(variant.image)
}

function badgeClass(badge?: string | null): string {
  if (!badge) return ''
  const lower = badge.toLowerCase()
  if (lower.includes('new') || lower.includes('digital')) return 'badge-teal'
  if (lower.includes('limited') || lower.includes('save')) return 'badge-gold'
  if (lower.includes('exclusive')) return 'badge-amber'
  return 'badge-gold'
}

function matchVariant(
  variants: Variant[],
  selection: Record<string, string>,
  optionTypes: string[],
): Variant | undefined {
  if (optionTypes.length === 0) return variants[0]
  return variants.find((v) =>
    optionTypes.every((type) =>
      (v.optionValues ?? []).some((ov) => ov.type === type && ov.value === selection[type]),
    ),
  )
}

interface Props {
  product: MerchProduct
}

export default function MerchProductCard({ product }: Props) {
  const { addItem } = useCart()
  const { currency } = useCurrency()

  const optionTypes = useMemo(
    () =>
      (product.optionTypes ?? [])
        .map((t) => ({
          name: t.name,
          values: (t.values ?? []).map((v) => v.value).filter(Boolean),
        }))
        .filter((t) => t.name && t.values.length > 0),
    [product.optionTypes],
  )
  const variants = (product.variants ?? []) as Variant[]
  const hasVariants = optionTypes.length > 0 && variants.length > 0

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    // Auto-select the first available value for each option type for quick UX.
    for (const type of optionTypes) {
      const firstValue = type.values[0]
      if (firstValue) initial[type.name] = firstValue
    }
    return initial
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedVariant = hasVariants
    ? matchVariant(
        variants,
        selection,
        optionTypes.map((t) => t.name),
      )
    : undefined

  const variantImage = variantImageUrl(selectedVariant)
  const displayImage = variantImage || productImageUrl(product)

  const displayPrice = selectedVariant
    ? priceFor(selectedVariant, currency)
    : priceFor(product, currency)
  const compareAt =
    currency === 'NGN' ? product.compareAtPriceNGN ?? null : product.compareAtPriceUSD ?? null

  const variantAvailable = selectedVariant
    ? Boolean(selectedVariant.available) && (selectedVariant.stock ?? 0) > 0
    : true
  const productAvailable = product.inStock !== false
  const canAdd = productAvailable && (hasVariants ? Boolean(selectedVariant) && variantAvailable : true)

  async function onAdd() {
    if (!canAdd) return
    setBusy(true)
    setError(null)
    const result = await addItem({
      type: 'Merch',
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity: 1,
    })
    setBusy(false)
    if (!result.ok) setError(result.error ?? 'Could not add to cart.')
  }

  return (
    <div className="product-card">
      <div
        className="product-img img-placeholder"
        style={{
          backgroundImage: displayImage ? `url('${displayImage}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 'inherit',
        }}
      >
        {product.badge && (
          <div className={`product-badge ${badgeClass(product.badge)}`}>{product.badge}</div>
        )}
      </div>

      <div className="product-body">
        <div className="product-name">{product.name}</div>

        {hasVariants && (
          <div className={styles.options}>
            {optionTypes.map((type) => (
              <div key={type.name} className={styles.optionRow}>
                <span className={styles.optionLabel}>{type.name}</span>
                {type.values.map((value) => {
                  // Is there at least one variant matching the rest of selection with this value?
                  const hypothetical = { ...selection, [type.name]: value }
                  const match = matchVariant(
                    variants,
                    hypothetical,
                    optionTypes.map((t) => t.name),
                  )
                  const unavailable =
                    !match || !match.available || (match.stock ?? 0) <= 0
                  return (
                    <button
                      key={value}
                      type="button"
                      className={styles.optionChip}
                      data-active={selection[type.name] === value}
                      data-unavailable={unavailable}
                      disabled={unavailable && selection[type.name] !== value}
                      onClick={() => setSelection((s) => ({ ...s, [type.name]: value }))}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">
            {formatMoney(displayPrice, currency)}
            {compareAt && compareAt > displayPrice && (
              <span className={styles.priceWas}>{formatMoney(compareAt, currency)}</span>
            )}
          </div>
          <button
            type="button"
            className="add-btn"
            onClick={onAdd}
            disabled={!canAdd || busy}
          >
            {busy
              ? 'Adding…'
              : !productAvailable
                ? 'Sold Out'
                : hasVariants && !selectedVariant
                  ? 'Select Options'
                  : hasVariants && !variantAvailable
                    ? 'Unavailable'
                    : 'Add to Cart'}
          </button>
        </div>

        {selectedVariant && variantAvailable && (selectedVariant.stock ?? 0) <= 5 && (
          <p className={styles.stockNote} data-low="true">
            Only {selectedVariant.stock} left
          </p>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
