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

  const navItems = navData?.navItems ?? [
    { label: 'Music', url: '/music', external: false, cta: false },
    { label: 'About', url: '/about', external: false, cta: false },
    { label: 'Tour', url: '/tour', external: false, cta: false },
    { label: 'Podcast', url: '/podcast', external: false, cta: false },
    { label: 'Journal', url: '/blog', external: false, cta: false },
    { label: 'Merch', url: '/merch', external: false, cta: true },
    { label: 'Media', url: '/media', external: false, cta: false },
    { label: 'Booking', url: '/contact', external: false, cta: false },
  ];

  console.log(navData?.navItems)

  return (
    <Providers initialCurrency={initialCurrency}>
      <header className="site-header">
        <AnnounceBar />
        <Nav items={navItems} linktreeUrl={artist?.socialLinks?.linktree} />
      </header>
      {children}
      <Footer
        socialLinks={artist?.socialLinks}
        footerText={undefined}
      />
      <CartDrawer />
    </Providers>
  );
}
