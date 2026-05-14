import type { Metadata } from 'next';
import BlogContent from '../../_components/BlogContent';
import { getBlogPosts } from '@/lib/api';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Behind the music, beyond the beat. Essays, interviews, and dispatches from the making of Afro country.',
};

export default async function BlogPage() {
  const [postsRes, featuredRes] = await Promise.all([
    getBlogPosts({ published: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getBlogPosts({ published: true, featured: true, limit: 1 }).catch(() => ({ docs: [], totalDocs: 0 })),
  ]);

  const posts = postsRes.docs;
  const categories = [...new Set(posts.map(p => p.category))];
  const featuredPost = featuredRes.docs[0] ?? null;

  return (
    <>
      <div className="blog-hero">
        <div className={styles.heroInner}>
          <div className="page-kicker">Stories &amp; Perspectives</div>
          <h1 className="page-title">The <em>Journal</em></h1>
          <p className="page-sub">Behind the music, beyond the beat. Essays, interviews, and dispatches from the making of Afro country.</p>
        </div>
      </div>
      <BlogContent posts={posts} categories={categories} featuredPost={featuredPost} />
    </>
  );
}
