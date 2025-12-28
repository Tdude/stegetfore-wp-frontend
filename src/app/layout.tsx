// src/app/layout.tsx
import { Lato, Raleway } from 'next/font/google';
import Script from 'next/script';
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

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-64.png', type: 'image/png', sizes: '64x64' },
    ],
    apple: [
      { url: '/favicon-500.png', sizes: '500x500', type: 'image/png' },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteInfo, menuItems } = await getLayoutData();

  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiHost = process.env.NEXT_PUBLIC_UMAMI_HOST;
  const shouldLoadUmami = Boolean(umamiWebsiteId && umamiHost);

  return (
    <html lang="en" suppressHydrationWarning className={`${lato.variable} ${raleway.variable}`}>
      <body suppressHydrationWarning>
        {shouldLoadUmami ? (
          <Script
            defer
            data-website-id={umamiWebsiteId}
            src={`${(umamiHost || '').replace(/\/$/, '')}/script.js`}
          />
        ) : null}
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