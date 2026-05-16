import AnnounceBar from '../_components/AnnounceBar';
import CartDrawer from '../_components/CartDrawer';
import Footer from '../_components/Footer';
import Nav from '../_components/Nav';
import Providers from '../_components/Providers';
import { getArtistProfile, getNavigation } from '@/lib/api';
import { detectInitialCurrency } from '@/lib/currency-detect';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [navData, artist, initialCurrency] = await Promise.all([
    getNavigation().catch(() => null),
    getArtistProfile().catch(() => null),
    detectInitialCurrency(),
  ]);

  const FALLBACK_NAV = [
    { label: 'Music', url: '/music', external: false, cta: false, locations: ['header'] },
    { label: 'About', url: '/about', external: false, cta: false, locations: ['header'] },
    { label: 'Tour', url: '/tour', external: false, cta: false, locations: ['header'] },
    { label: 'Podcast', url: '/podcast', external: false, cta: false, locations: ['header'] },
    { label: 'Journal', url: '/blog', external: false, cta: false, locations: ['header'] },
    { label: 'Merch', url: '/merch', external: false, cta: true, locations: ['header'] },
    { label: 'Media', url: '/media', external: false, cta: false, locations: ['header'] },
    { label: 'Booking', url: '/contact', external: false, cta: false, locations: ['header'] },
  ];

  const allNavItems = navData?.navItems ?? FALLBACK_NAV;
  // Items with no `locations` set (legacy data) are treated as header items so existing
  // pre-migration data keeps rendering on the nav. Items explicitly tagged 'footer' only
  // are excluded from the header.
  const headerItems = allNavItems.filter((item) => {
    const locations = (item as { locations?: string[] | null }).locations;
    return !locations || locations.length === 0 || locations.includes('header');
  });

  return (
    <Providers initialCurrency={initialCurrency}>
      <header className="site-header">
        <AnnounceBar />
        <Nav items={headerItems} linktreeUrl={artist?.socialLinks?.linktree} />
      </header>
      {children}
      <Footer
        socialLinks={artist?.socialLinks}
        footerText={undefined}
        navItems={allNavItems}
      />
      <CartDrawer />
    </Providers>
  );
}
