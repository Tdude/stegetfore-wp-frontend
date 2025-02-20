// src/components/Header.tsx
import Link from 'next/link';
import type { MenuItem, SiteInfo } from '@/lib/types';

interface HeaderProps {
  siteInfo: SiteInfo;
  menuItems: MenuItem[];
}

export default function Header({ siteInfo, menuItems }: HeaderProps) {
  const { name } = siteInfo || {};
  const items = menuItems || [];

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-gray-200"
          >
            {name || 'Home'}
          </Link>

          <div className="space-x-4">
            {items.map((item) => {
              const href = item.slug || '/';
              const linkProps = item.target ? { target: item.target } : {};

              return (
                <Link
                  key={item.ID}
                  href={href}
                  className="text-white hover:text-gray-200 transition-colors"
                  {...linkProps}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}