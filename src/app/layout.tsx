// src/app/layout.tsx
import { getLayoutData } from '@/lib/layoutUtils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import './globals.css';

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
        <div className="min-h-screen flex flex-col">
          <Header siteInfo={siteInfo} menuItems={menuItems} />
          <main className="flex-grow">
            {children}
          </main>
          <Providers />
          <Footer />
        </div>
      </body>
    </html>
  );
}