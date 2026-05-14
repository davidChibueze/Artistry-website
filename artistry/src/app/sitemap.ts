import type { MetadataRoute } from 'next';
import { getBlogPosts, getReleases } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://poshbugati.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsRes, releasesRes] = await Promise.all([
    getBlogPosts({ published: true }).catch(() => ({ docs: [], totalDocs: 0 })),
    getReleases().catch(() => ({ docs: [], totalDocs: 0 })),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/music`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tour`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/podcast`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/merch`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/media`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  const blogPosts = postsRes.docs.map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const releases = releasesRes.docs.map(release => ({
    url: `${BASE}/music/${release.slug}`,
    lastModified: new Date(release.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogPosts, ...releases];
}
