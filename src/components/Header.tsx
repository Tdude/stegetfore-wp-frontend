// src/components/Header.tsx
import Link from 'next/link';
import { fetchSiteInfo, fetchMainMenu } from '@/lib/api';
import type { MenuItem } from '@/lib/api';

// Make Header a Client Component
'use client';

function NavLink({ href, children, target }: { href: string; children: React.ReactNode; target?: string }) {
  return (
    <Link
      href={href}
      className="text-white hover:text-gray-200 transition-colors"
      target={target}
    >
      {children}
    </Link>
  );
}

export default function Header({
  siteInfo,
  menuItems
}: {
  siteInfo: { name: string; description: string; }
  menuItems: MenuItem[]
}) {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <NavLink href="/">
            <span className="text-xl font-bold text-white">
              {siteInfo.name}
            </span>
          </NavLink>

          <div className="space-x-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.ID}
                href={item.slug}
                target={item.target || undefined}
              >
                {item.title}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
