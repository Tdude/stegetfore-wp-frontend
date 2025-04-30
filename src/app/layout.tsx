// src/app/layout.tsx
import { getLayoutData } from '@/lib/layoutUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ContentFade from '@/components/ContentFade';
import './globals.css';
// import { PageTransitionOverlay } from "@/components/ui/PageTransitionOverlay";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteInfo, menuItems } = await getLayoutData();

  return (
    <html lang="en" suppressHydrationWarning>
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