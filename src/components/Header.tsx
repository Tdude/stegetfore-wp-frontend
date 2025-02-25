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

  function getFormattedHref(slug: string) {
    // If it's the home page
    if (slug === '/' || !slug) {
      return '/';
    }

    // Check if the slug contains "posts/"
    if (slug.startsWith('posts/')) {
      return `/${slug}`; // Keep the "posts/" prefix if it exists
    }

    // For other URLs, check if they're posts or pages
    // You might want to add more logic here based on your needs
    return `/${slug}`;
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-stretch h-16">
          <Link
            href="/"
            className="text-xl font-bold text-gray-800 hover:text-black flex items-center"
          >
            {name || 'Home'}
          </Link>

          <div className="flex items-stretch">
            {items.map((item) => {
              const href = getFormattedHref(item.slug);
              const linkProps = item.target ? { target: item.target } : {};

              return (
                <Link
                  key={item.ID}
                  href={href}
                  className="text-gray-800 hover:text-black transition-colors px-4 flex items-center border-b-2 border-transparent hover:border-primary"
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
