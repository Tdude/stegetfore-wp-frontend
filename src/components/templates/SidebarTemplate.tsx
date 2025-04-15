// src/components/templates/SidebarTemplate.tsx
'use client';

import React from 'react';

import { LocalPage } from '@/lib/types/contentTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import { useModules } from '@/hooks/useModules';

// Removed unused imports useEffect and useState

export default function SidebarTemplate({ page }: { page: LocalPage }) {
  // Use the modules hook to check for header modules
  const { modulesBySection } = useModules({
    pageModules: Array.isArray(page.modules) ? page.modules : [],
  });
  
  // Check if a Hero module is present
  const hasHeroModule = modulesBySection?.header?.some(module => module.type === 'hero');
  
  return (
    <TemplateTransitionWrapper>
      <div className="max-w-7xl mx-auto px-4 my-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <p>The sidebar templ</p>
        <article className="md:col-span-3">
          {/* Only show title if no Hero module is present */}
          {!hasHeroModule && (
            <h1
              className="text-4xl font-bold mb-4"
              dangerouslySetInnerHTML={{ __html: page.title.rendered }}
            />
          )}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </article>
        <aside className="md:col-span-1">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
          </div>
        </aside>
      </div>
    </TemplateTransitionWrapper>
  );
}