// src/app/layout.tsx
import { Lato, Raleway } from 'next/font/google';
import { getLayoutData } from '@/lib/layoutUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ContentFade from '@/components/ContentFade';
import './globals.css';
// import { PageTransitionOverlay } from "@/components/ui/PageTransitionOverlay";

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
});

const raleway = Raleway({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteInfo, menuItems } = await getLayoutData();

  return (
    <html lang="en" suppressHydrationWarning className={`${lato.variable} ${raleway.variable}`}>
      <body suppressHydrationWarning>
        <Providers>
          <ContentFade />
          {/* Fade effect logic for main content */}
          <div
            className="min-h-screen flex flex-col transition-opacity duration-500"
            style={{ transitionProperty: 'opacity' }}
            suppressHydrationWarning
            id="main-fade-container"
          >
            <Header siteInfo={siteInfo} menuItems={menuItems} />
            <main className="flex-grow transition-opacity duration-500" style={{ transitionProperty: 'opacity' }}>
              {children}
            </main>
          </div>
          <Footer siteInfo={siteInfo} menuItems={menuItems} />
        </Providers>
      </body>
    </html>
  );
}