import type { Metadata } from 'next';
import MerchContent from '../../_components/MerchContent';
import { getMerchProducts } from '@/lib/api';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Merch',
  description: 'Limited drops for the first wave. Own a piece of the movement — from limited tees to exclusive vinyl bundles. Ships globally.',
};

export default async function MerchPage() {
  const productsRes = await getMerchProducts({ inStock: true }).catch(() => ({ docs: [], totalDocs: 0 }));
  const products = productsRes.docs;
  const categories: string[] = [...new Set(products.map(p => p.category).filter(Boolean) as string[])];

  return (
    <>
      <div className="merch-hero">
        <div className={styles.heroInner}>
          <div className="page-kicker">Official Store</div>
          <h1 className="page-title">The Switch <em>Merch</em></h1>
          <p className="page-sub">Limited drops for the first wave. Own a piece of the movement — from limited tees to exclusive vinyl bundles.</p>
        </div>
      </div>
      <MerchContent products={products} categories={categories} />
    </>
  );
}
