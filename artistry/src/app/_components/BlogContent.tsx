'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSubscription, getMediaUrl } from '@/lib/api';
import type { BlogPost } from '@/payload-types';
import styles from './BlogContent.module.css';

interface Props {
  posts: BlogPost[];
  categories: string[];
  featuredPost?: BlogPost | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPostImageUrl(post: BlogPost): string {
  return getMediaUrl(post.coverImage);
}

export default function BlogContent({ posts, categories, featuredPost }: Props) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showing, setShowing] = useState(6);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const filters = ['All', ...categories];

  const filtered = activeFilter === 'All' ? posts : posts.filter(p => p.category === activeFilter);
  const visible = filtered.slice(0, showing);

  const handleFilter = (f: string) => {
    setActiveFilter(f);
    setShowing(6);
  };

  const handleSub = async () => {
    if (!email.trim()) return;
    setSubLoading(true);
    try {
      await createSubscription({ email: email.trim(), type: 'Newsletter' });
      setSubscribed(true);
      setEmail('');
    } catch {
    }
    setSubLoading(false);
  };

  return (
    <>
      <div className={styles.filterBarWrap}>
        <div className="filter-bar">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-btn${activeFilter === f ? ' active' : ''}`}
              onClick={() => handleFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="section-pad">
        <div className="section-wrap">
          {featuredPost && (
            <Link href="/blog" className="post-featured">
              <div
                className="post-featured-img img-placeholder"
                style={{
                  backgroundImage: getPostImageUrl(featuredPost) ? `url('${getPostImageUrl(featuredPost)}')` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: 'inherit',
                }}
              />
              <div className="post-featured-body">
                <div className="post-cat">{featuredPost.category} · {formatDate(featuredPost.publishedDate)}</div>
                <div className="post-title-lg">{featuredPost.title}</div>
                <div className="post-excerpt">{featuredPost.excerpt}</div>
                <div className="post-byline"><strong>Poshbugati</strong> <span>·</span> {featuredPost.readTime || '5'} min read</div>
              </div>
            </Link>
          )}

          <div className="posts-grid">
            {visible.map((p) => (
              <Link key={p.id} href="/blog" className="post-card">
                <div
                  className="post-card-img img-placeholder"
                  style={{
                    backgroundImage: getPostImageUrl(p) ? `url('${getPostImageUrl(p)}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 'inherit',
                  }}
                />
                <div className="post-card-body">
                  <div className="post-card-cat">{p.category} · {formatDate(p.publishedDate)}</div>
                  <div className="post-card-title">{p.title}</div>
                  <div className="post-card-excerpt">{p.excerpt}</div>
                  <div className="post-card-meta">{p.readTime || '5'} min read</div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length > showing && (
            <div className={styles.loadMoreWrap}>
              <button className="btn btn-outline" onClick={() => setShowing(s => s + 3)}>Load More</button>
            </div>
          )}

          <div className="blog-sub">
            <h3>Stories in your <em>inbox.</em></h3>
            <p>New journal entries, podcast episodes, and behind-the-scenes content — straight to you.</p>
            <div className={styles.newsletterRow}>
              <input
                type="email"
                className={styles.newsletterInput}
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button
                className={styles.newsletterBtn}
                onClick={handleSub}
                disabled={subLoading}
              >
                {subLoading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>
            {subscribed && (
              <p className={styles.successMsg}>✓ Subscribed! First story lands soon.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
