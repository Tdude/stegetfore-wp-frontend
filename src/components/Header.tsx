// src/components/Header.tsx
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, LogIn, LogOut } from 'lucide-react';
import type { MenuItem, SiteInfo } from '@/lib/types/contentTypes';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  siteInfo: SiteInfo;
  menuItems: MenuItem[];
  megaMenuLayout?: 'grid' | 'stack';
}

// Use grid|stack for mega menu layout
export default function Header({ siteInfo, menuItems, megaMenuLayout = 'stack' }: HeaderProps) {
  const { name } = siteInfo || {};
  const logoUrl = siteInfo?.logo_url || '/Maja-logo-Tryggve-text.svg'; // fallback logo
  const items = menuItems || [];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Ref for the main navigation container (to calculate relative offsets)
  const navContainerRef = useRef<HTMLDivElement>(null);

  // States for 'grid' layout (mega menu panel)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeSubMenuItems, setActiveSubMenuItems] = useState<MenuItem[] | null>(null);
  const [activeParentMenuLeft, setActiveParentMenuLeft] = useState<number>(0); // Offset for grid menu content

  // State for 'stack' layout (individual dropdowns)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // State for the sliding indicator
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

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

  const handleMenuItemMouseEnter = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    setIndicatorStyle({
      left: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
    });
  };

  const handleMenuListMouseLeave = () => {
    setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
  };

  const renderMenuItem = (item: MenuItem) => {
    const href = getFormattedHref(item.slug);
    const linkProps = item.target ? { target: item.target } : {};
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li 
        key={item.ID} 
        className="h-16 flex items-center relative" 
        onMouseEnter={(event) => {
          handleMenuItemMouseEnter(event); // For sliding indicator
          if (megaMenuLayout === 'stack' && hasChildren) {
            setOpenDropdownId(item.ID);
          } else if (megaMenuLayout === 'grid' && hasChildren) {
            setActiveSubMenuItems(item.children || null);
            if (navContainerRef.current && event.currentTarget) {
              const liRect = event.currentTarget.getBoundingClientRect();
              const navContainerRect = navContainerRef.current.getBoundingClientRect();
              const relativeLeft = liRect.left - navContainerRect.left;
              setActiveParentMenuLeft(relativeLeft);
            }
          } else if (megaMenuLayout === 'grid') {
            setActiveSubMenuItems(null); // Clear for items without children in grid mode
            // Optionally reset activeParentMenuLeft here if needed, though panel won't show
          }
        }}
        onMouseLeave={() => {
          if (megaMenuLayout === 'stack') {
            // Delay hiding to allow mouse to enter dropdown, handled by dropdown's onMouseEnter/Leave
          } else if (megaMenuLayout === 'grid') {
            // Handled by the main wrapper's onMouseLeave for grid mode
          }
        }}
      >
        {/* All links have the same container structure */}
        <div className="h-full flex items-center">
          <Link
            href={href}
            className="flex items-center h-full px-4 text-gray-800 text-lg hover:text-black transition-colors border-t-2 border-transparent"
            {...linkProps}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>{item.title}</span>
            {hasChildren && <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />}
          </Link>
        </div>

        {/* Individual Dropdown for 'stack' layout */}
        {megaMenuLayout === 'stack' && hasChildren && openDropdownId === item.ID && (
          <div 
            className="absolute z-50 left-0 top-full w-56 bg-white rounded-b-md shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5"
            onMouseEnter={() => setOpenDropdownId(item.ID)} // Keep open when mouse enters dropdown
            onMouseLeave={() => setOpenDropdownId(null)}   // Close when mouse leaves dropdown
          >
            <ul className="py-1">
              {item.children?.map((child) => (
                <li key={child.ID}>
                  <Link
                    href={getFormattedHref(child.slug)}
                    className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-black whitespace-nowrap"
                    {...(child.target ? { target: child.target } : {})}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setOpenDropdownId(null); // Close dropdown on click
                    }}
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
    <header className="bg-white shadow-sm relative">
      <div /* Main hover wrapper - primarily for 'grid' layout mega menu */
        onMouseEnter={() => {
          if (megaMenuLayout === 'grid') {
            setIsMegaMenuOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (megaMenuLayout === 'grid') {
            setIsMegaMenuOpen(false);
            setActiveSubMenuItems(null);
            setActiveParentMenuLeft(0); // Reset offset when mouse leaves header area
          }
        }}
      >
        <div className="container mx-auto px-4 py-2" ref={megaMenuLayout === 'grid' ? navContainerRef : null}>
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
            <ul 
              className="hidden lg:flex items-stretch h-16 relative" // Added relative for positioning context
              onMouseLeave={handleMenuListMouseLeave} // Hide indicator when mouse leaves the UL
            >
              {/* Sliding Indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  height: '2px', // Corresponds to border-t-2
                  backgroundColor: 'hsl(var(--primary))', // Use primary color from CSS variables
                  opacity: indicatorStyle.opacity,
                  transition: 'left 0.25s ease-out, width 0.25s ease-out, opacity 0.2s ease-out',
                  pointerEvents: 'none', // Ensure it doesn't interfere with mouse events
                  zIndex: 10, // Above items, below dropdowns (which are z-50)
                }}
              />
              {items.map(renderMenuItem)}
            </ul>

            {/* Login or other button - desktop */}
            <div className="hidden lg:flex items-center h-16">
              <div className="flex items-center space-x-2">
                <Link href="/kontakt" className="hidden lg:inline-block">
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
                    <Link href="/kontakt">
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

        {/* Mega Menu Panel - ONLY for 'grid' layout */}
        {megaMenuLayout === 'grid' && isMegaMenuOpen && activeSubMenuItems && activeSubMenuItems.length > 0 && (
          <div className="absolute left-0 right-0 top-full bg-white shadow-lg z-40">
            <div className="container mx-auto px-4 py-2"> 
              <div style={{ marginLeft: `${activeParentMenuLeft}px` }}> {/* Apply dynamic horizontal offset */}
                {/* Submenu items styled as a vertical stack, similar to 'stack' mode dropdowns */}
                <ul className="py-1 flex flex-col bg-white w-56 rounded-md shadow-xs"> {/* Mimic stack dropdown style */}
                  {activeSubMenuItems.map((child) => (
                    <li key={child.ID}>
                      <Link
                        href={getFormattedHref(child.slug)}
                        className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-black whitespace-nowrap"
                        {...(child.target ? { target: child.target } : {})}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsMegaMenuOpen(false); // Close mega menu on click
                          setActiveSubMenuItems(null);
                          setActiveParentMenuLeft(0); // Reset offset on click
                        }}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div> {/* End of Main Hover Wrapper */}
    </header>
  );
}