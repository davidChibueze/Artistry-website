'use client';

import { useState } from 'react';
import { Globe, Package, RotateCcw, Zap } from 'lucide-react';
import type { MerchProduct } from '@/payload-types';
import MerchProductCard from './MerchProductCard';
import styles from './MerchContent.module.css';

interface Props {
  products: MerchProduct[];
  categories: string[];
}

export default function MerchContent({ products, categories }: Props) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', ...categories.filter(c => c !== 'All')];
  const filtered = activeFilter === 'All' ? products : products.filter(p => p.category === activeFilter);

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
          <div className="section-label">All Products</div>
          <h2 className={`section-title ${styles.sectionTitleSpaced}`}>Shop the <em>Drop</em></h2>

          <div className="products-grid">
            {filtered.map((p) => (
              <MerchProductCard key={p.id} product={p} />
            ))}
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
    </>
  );
}
