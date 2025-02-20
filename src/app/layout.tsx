// src/app/layout.tsx
import { Suspense } from 'react';
import { fetchSiteInfo, fetchMainMenu } from '@/lib/api';
import Header from '@/components/Header';
import HeaderSkeleton from '@/components/HeaderSkeleton';
import Footer from '@/components/Footer';

async function HeaderWrapper() {
  const [siteInfo, menuItems] = await Promise.all([
    fetchSiteInfo(),
    fetchMainMenu()
  ]);

  return <Header siteInfo={siteInfo} menuItems={menuItems} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={<HeaderSkeleton />}>
          <HeaderWrapper />
        </Suspense>
        {children}
        <Footer />
      </body>
    </html>
  );
}