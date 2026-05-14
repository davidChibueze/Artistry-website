import type { Metadata } from 'next';
import './globals.css';
import { getSiteSettings, getMediaUrl } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);

  return {
    title: {
      default: settings?.siteTitle ? `${settings.siteTitle} \u2014 Afro Country Artist` : 'Poshbugati \u2014 Afro Country Artist',
      template: `%s \u2014 ${settings?.siteTitle || 'Poshbugati'}`,
    },
    description: settings?.siteDescription || 'Poshbugati is an Afro country artist. The Switch EP \u2014 exclusive on poshbugati.com.',
    keywords: ['Poshbugati', 'Afro country', 'African music', 'country music', 'The Switch EP', 'Afrobeat'],
    openGraph: {
      siteName: settings?.siteTitle || 'Poshbugati',
      type: 'website',
      locale: 'en_US',
      images: settings?.ogImage?.url
        ? [{ url: getMediaUrl(settings.ogImage), alt: settings.ogImage.alt || settings.siteTitle }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
