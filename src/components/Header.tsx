// src/components/Header.tsx
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, LogIn, LogOut } from 'lucide-react';
import type { MenuItem, SiteInfo } from '@/lib/types/contentTypes';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  siteInfo: SiteInfo;
  menuItems: MenuItem[];
}

export default function Header({ siteInfo, menuItems }: HeaderProps) {
  const { name } = siteInfo || {};
  const logoUrl = siteInfo?.logo_url || '/Maja-logo-Tryggve-text.svg'; // fallback logo
  const items = menuItems || [];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  function getFormattedHref(slug: string) {
    if (slug === '/' || !slug) {
      return '/';
    }
    if (slug === 'blog') {
      return '/blog';
    }
    if (slug.startsWith('posts/')) {
      return `/${slug}`;
    }
    return `/${slug}`;
  }

  const renderMenuItem = (item: MenuItem) => {
    const href = getFormattedHref(item.slug);
    const linkProps = item.target ? { target: item.target } : {};
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={item.ID} className="relative group h-16 flex items-center">
        {/* All links have the same container structure */}
        <div className="h-full flex items-center">
          <Link
            href={href}
            className="flex items-center h-full px-4 text-gray-800 text-lg hover:text-black transition-colors border-t-2 border-transparent hover:border-yellow-500"
            {...linkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>{item.title}</span>
            {hasChildren && <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />}
          </Link>
        </div>

        {/* Dropdown for items with children */}
        {hasChildren && (
          <div className="absolute z-50 left-0 top-full w-48 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ul className="bg-white rounded-b-md shadow-sm overflow-hidden">

              {item.children?.map((child) => (
                <li key={child.ID}>
                  <Link
                    href={getFormattedHref(child.slug)}
                    className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    {...(child.target ? { target: child.target } : {})}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {child.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  // Listen for open-login-modal event globally
  useEffect(() => {
    function handleOpenLoginModal() {
      setLoginModalOpen(true);
    }
    window.addEventListener('open-login-modal', handleOpenLoginModal);
    return () => {
      window.removeEventListener('open-login-modal', handleOpenLoginModal);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <nav className="flex justify-between items-stretch">
          {/* Logo */}
          <div className="h-16 flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-black"
            >
              <Image src={logoUrl} alt={name || 'Home'} width={120} height={60} />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden h-16 flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center text-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Navigation items - Desktop */}
          <ul className="hidden lg:flex items-stretch h-16">
            {items.map(renderMenuItem)}
          </ul>

          {/* Login or other button - desktop */}
          <div className="hidden lg:flex items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/start" className="hidden lg:inline-block">
                <Button variant="primary" size="md" className="px-4 py-1">
                  Börja nu
                </Button>
              </Link>

              {isAuthenticated ? (
                <Button
                  onClick={logout}
                  variant="default"
                  size="md"
                  className="hidden lg:flex items-center px-3 py-1 opacity-50 hover:opacity-90 transition-opacity"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="text-sm">Logga ut</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setLoginModalOpen(true)}
                  variant="default"
                  size="md"
                  className="hidden lg:flex"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="text-sm">Logga in</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-white shadow-sm z-50 lg:hidden">
              <ul className="py-2 px-4">
                {items.map(item => {
                  const href = getFormattedHref(item.slug);
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <li key={item.ID} className="py-2">
                      <Link
                        href={href}
                        className="block font-medium text-gray-800"
                        onClick={() => !hasChildren && setMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>

                      {hasChildren && (
                        <ul className="pl-4 mt-2 border-l border-gray-200">
                          {item.children?.map(child => (
                            <li key={child.ID} className="py-1">
                              <Link
                                href={getFormattedHref(child.slug)}
                                className="block text-sm text-gray-700"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}

                <li className="mt-4 mb-2">
                  <Link href="/start">
                    <Button variant="primary" size="md" className="w-full px-4 py-1.5">
                      Börja nu
                    </Button>
                  </Link>
                </li>

                <li className="mt-2 mb-4">
                  {isAuthenticated ? (
                    <Button
                      onClick={logout}
                      variant="default"
                      size="md"
                      className="w-full flex items-center justify-center px-4 py-1.5 opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      <span className="text-sm">Logga ut</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setLoginModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      variant="default"
                      size="md"
                      className="w-full flex items-center justify-center px-4 py-1.5"
                    >
                      <LogIn className="h-4 w-4 mr-1" />
                      <span className="text-sm">Logga in</span>
                    </Button>
                  )}
                </li>
              </ul>
            </div>
          )}
          {/* Login Modal */}
          <LoginModal 
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
          />
        </nav>
      </div>
    </header>
  );
}