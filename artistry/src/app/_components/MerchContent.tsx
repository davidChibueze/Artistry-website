'use client';

import { useState, useCallback } from 'react';
import { Globe, Package, RotateCcw, Zap } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';
import type { MerchProduct } from '@/payload-types';
import styles from './MerchContent.module.css';

interface Props {
  products: MerchProduct[];
  categories: string[];
}

function getProductImageUrl(product: MerchProduct): string {
  const img = product.images?.[0]?.image;
  return getMediaUrl(img);
}

function badgeClass(badge?: string) {
  if (!badge) return '';
  if (badge.toLowerCase().includes('new') || badge.toLowerCase().includes('digital')) return 'badge-teal';
  if (badge.toLowerCase().includes('limited') || badge.toLowerCase().includes('save')) return 'badge-gold';
  if (badge.toLowerCase().includes('exclusive')) return 'badge-amber';
  return 'badge-gold';
}

function formatPrice(price: number, compareAt?: number | null, currency = 'USD') {
  const symbol = currency === 'NGN' ? '₦' : '$';
  const formatted = `${symbol}${price.toFixed(2)}`;
  const was = compareAt ? `${symbol}${compareAt.toFixed(2)}` : '';
  return { formatted, was };
}

export default function MerchContent({ products, categories }: Props) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [toast, setToast] = useState<string | null>(null);

  const filters = ['All', ...categories.filter(c => c !== 'All')];
  const filtered = activeFilter === 'All' ? products : products.filter(p => p.category === activeFilter);

  const addToCart = useCallback((name: string, price: string) => {
    setToast(`✓ ${name} (${price}) added to cart`);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <>
      <div className={styles.catsBarWrap}>
        <div className="merch-cats">
          {filters.map(c => (
            <button
              key={c}
              className={`merch-cat-btn${activeFilter === c ? ' active' : ''}`}
              onClick={() => setActiveFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="section-pad">
        <div className="section-wrap">
          <div className="bundle-hero">
            <div
              className="bundle-img img-placeholder"
              style={{
                backgroundImage: products.length ? `url('${getProductImageUrl(products[0])}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: 'inherit',
              }}
            />
            <div className="bundle-body">
              <div className="bundle-kicker">Best Value · Limited</div>
              <h2 className="bundle-title">The <em>Complete Switch</em> Bundle</h2>
              <p className={styles.bundleDesc}>
                Everything you need to own The Switch experience. One drop, one chance.
              </p>
              <ul className="bundle-includes">
                <li>The Switch EP — 180g vinyl</li>
                <li>Exclusive The Switch Tee (Limited Print)</li>
                <li>Digital Liner Notes PDF (signed)</li>
                <li>Early stream access — 48hrs before release</li>
                <li>Handwritten thank-you postcard</li>
              </ul>
              <div className="bundle-price-row">
                <div className="bundle-price">$85</div>
                <div className="bundle-was">$120</div>
                <div className="bundle-save">Save 30%</div>
              </div>
              <button className="btn btn-gold" onClick={() => addToCart('The Complete Switch Bundle', '$85')}>
                Add Bundle to Cart
              </button>
            </div>
          </div>

          <div className="section-label">All Products</div>
          <h2 className={`section-title ${styles.sectionTitleSpaced}`}>Shop the <em>Drop</em></h2>

          <div className="products-grid">
            {filtered.map((p) => {
              const { formatted, was } = formatPrice(p.price, p.compareAtPrice);
              return (
                <div key={p.id} className="product-card">
                  <div
                    className="product-img img-placeholder"
                    style={{
                      backgroundImage: getProductImageUrl(p) ? `url('${getProductImageUrl(p)}')` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: 'inherit',
                    }}
                  >
                    {p.badge && (
                      <div className={`product-badge ${badgeClass(p.badge)}`}>{p.badge}</div>
                    )}
                  </div>
                  <div className="product-body">
                    <div className="product-name">{p.name}</div>
                    <div className="product-variants">
                      {p.variants?.map(v => v.options?.map(o => o.option).join(' / ') ?? '').join(' · ')}
                    </div>
                    <div className="product-footer">
                      <div className="product-price">
                        {formatted}{was && <span>{was}</span>}
                      </div>
                      <button
                        className="add-btn"
                        onClick={() => addToCart(p.name, formatted)}
                        disabled={!p.inStock}
                      >
                        {p.inStock ? 'Add to Cart' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shipping-strip">
            <div className="shipping-item">
              <Globe className={`icon-lg ${styles.shippingIcon}`} />
              <div className="ship-title">Ships Globally</div>
              <div className="ship-desc">International shipping from Lagos. Tracked delivery worldwide.</div>
            </div>
            <div className="shipping-item">
              <Package className={`icon-lg ${styles.shippingIcon}`} />
              <div className="ship-title">Secure Packaging</div>
              <div className="ship-desc">Vinyl and apparel packed to arrive in perfect condition.</div>
            </div>
            <div className="shipping-item">
              <RotateCcw className={`icon-lg ${styles.shippingIcon}`} />
              <div className="ship-title">Easy Returns</div>
              <div className="ship-desc">30-day return policy on all apparel. Music is final sale.</div>
            </div>
            <div className="shipping-item">
              <Zap className={`icon-lg ${styles.shippingIcon}`} />
              <div className="ship-title">Drop Shipping</div>
              <div className="ship-desc">Pre-orders ship the week of release.</div>
            </div>
          </div>
        </div>
      </section>

      <div className={`cart-toast${toast ? ' show' : ''}`}>
        <div className="toast-dot" />
        <span>{toast}</span>
      </div>
    </>
  );
}
