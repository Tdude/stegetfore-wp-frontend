// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';

/**
 * SiteInfo interface defining the structure of the siteInfo prop
 */
interface SiteInfo {
  name?: string;
  logo_url?: string;
  footerMenu?: Array<{ label: string; url: string }>;
}

/**
 * MenuItem interface defining the structure of the menuItem prop
 */
interface MenuItem {
  ID: number;
  title: string;
  slug: string;
  target?: string;
  children?: MenuItem[];
}

/**
 * FooterProps interface defining the structure of the Footer props
 */
interface FooterProps {
  siteInfo?: SiteInfo;
  menuItems?: MenuItem[];
}

/**
 * Footer Component
 * Site footer with navigation and copyright info
 * Visual styling based on Bigspring theme
 */
export default function Footer({ siteInfo = {} as SiteInfo, menuItems = [] }: FooterProps) {
  // Get site info with fallbacks
  const siteName = siteInfo?.name || 'Tryggve';
  const logoUrl = siteInfo?.logo_url || '/Maja-logo-tryggve-text-inverted.svg';
  const year = new Date().getFullYear();

  // Function to format href based on slug
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

  // Track open/close state for all menu items by ID
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Toggle open/close for a given menu key
  function toggleMenu(key: string) {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Recursive rendering for dropdown-style menu items in vertical layout
  function renderMenuItem(item: MenuItem, parentKey = '') {
    const hasChildren = item.children && item.children.length > 0;
    const key = parentKey + item.ID;
    const open = !!openMenus[key];

    return (
      <li key={key} className="relative">
        <div
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={() => hasChildren && toggleMenu(key)}
        >
          <Link
            href={getFormattedHref(item.slug)}
            className="text-gray-400 hover:text-primary transition-colors flex-1"
            target={item.target}
            onClick={e => e.stopPropagation()}
          >
            {item.title}
          </Link>
          {hasChildren && (
            <button
              type="button"
              className="ml-2 text-xs text-gray-500 focus:outline-none"
              aria-expanded={open}
              aria-controls={`submenu-${key}`}
              tabIndex={0}
              onClick={e => { e.stopPropagation(); toggleMenu(key); }}
            >
              <span className={open ? 'rotate-180 transition-transform' : 'transition-transform'}>▼</span>
            </button>
          )}
        </div>
        {hasChildren && (
          <div
            className={
              'transition-all duration-300 overflow-hidden' +
              (open ? ' max-h-96 opacity-100' : ' max-h-0 opacity-0')
            }
            style={{
              // For smoothness: use maxHeight, but allow for variable submenu length
              // 384px (max-h-96) is enough for most submenus; adjust if needed
            }}
          >
            <ul
              id={`submenu-${key}`}
              className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-4"
            >
              {item.children!.map((child) => renderMenuItem(child, key + '-'))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company Info */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-block mb-4">
              {logoUrl ? (
                <div className="relative h-20 w-36">
                  <Image 
                    src={logoUrl} 
                    alt={siteName}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 250px, 300px"
                  />
                </div>
              ) : (
                <span className="text-xl font-bold text-white">
                  {siteName}
                </span>
              )}
            </Link>
            <p className="mb-6 text-gray-200">
              Stödjer lärare med kunskap, verktyg och gemenskap för bättre läranderesultat.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="md:col-span-4">
            <h3 className="text-xl font-bold mb-4">Snabblänkar</h3>
            <ul className="space-y-2">
              {menuItems && menuItems.length > 0 ? (
                menuItems.map((item) => renderMenuItem(item))
              ) : (
                <>
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                      Start
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">
                      Om oss
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-gray-400 hover:text-primary transition-colors">
                      Blogg
                    </Link>
                  </li>
                  <li>
                    <Link href="/kontakt" className="text-gray-400 hover:text-primary transition-colors">
                      Kontakt
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="md:col-span-4">
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex">
                <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-gray-400">Stockholm, Sweden</span>
              </li>
              <li className="flex">
                <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <a href="mailto:info@stegetfore.nu" className="text-gray-400 hover:text-primary transition-colors">
                  info@stegetfore.nu
                </a>
              </li>
              {/* Telephone contact temporarily removed */}
              {/*
              <li className="flex">
                <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <a href="tel:+46123456789" className="text-gray-400 hover:text-primary transition-colors">
                  +46 123456789
                </a>
              </li>
              */}
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; {year} {siteName}. Alla rättigheter förbehålles.
          </p>
        </div>
      </div>
    </footer>
  );
}
