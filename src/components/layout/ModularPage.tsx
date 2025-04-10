// src/components/layout/ModularPage.tsx
'use client';

import React from 'react';
import { Module } from '@/lib/types/moduleTypes';
import { groupModulesBySection } from '@/services/moduleService';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { cn } from '@/lib/utils';

interface ModularPageProps {
  modules: Module[];
  className?: string;
  sectionLayouts?: Record<string, string>;
  headerClassName?: string;
  mainClassName?: string;
  sidebarClassName?: string;
  footerClassName?: string;
}

export default function ModularPage({
  modules,
  className = '',
  sectionLayouts = {},
  headerClassName = '',
  mainClassName = '',
  sidebarClassName = '',
  footerClassName = '',
}: ModularPageProps) {
  // Group modules by section
  const sections = groupModulesBySection(modules);

  // Default section layouts
  const defaultSectionLayouts = {
    header: 'w-full',
    main: 'flex-grow',
    sidebar: 'w-full md:w-1/3 lg:w-1/4',
    footer: 'w-full',
  };

  // Merge default layouts with provided layouts
  const finalSectionLayouts = {
    ...defaultSectionLayouts,
    ...sectionLayouts,
  };

  return (
    <div className={cn('flex flex-col min-h-screen', className)}>
      {/* Header section */}
      {sections.header?.length > 0 && (
        <header className={cn(finalSectionLayouts.header, headerClassName)}>
          {sections.header.map(module => (
            <ModuleRenderer
              key={`header-${module.id}`}
              module={module}
            />
          ))}
        </header>
      )}

      {/* Main content with optional sidebar */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Main content */}
        <main className={cn(finalSectionLayouts.main, mainClassName)}>
          {sections.main?.map(module => (
            <ModuleRenderer
              key={`main-${module.id}`}
              module={module}
            />
          ))}
        </main>

        {/* Sidebar if it has modules */}
        {sections.sidebar?.length > 0 && (
          <aside className={cn(finalSectionLayouts.sidebar, sidebarClassName)}>
            {sections.sidebar.map(module => (
              <ModuleRenderer
                key={`sidebar-${module.id}`}
                module={module}
              />
            ))}
          </aside>
        )}
      </div>

      {/* Footer section */}
      {sections.footer?.length > 0 && (
        <footer className={cn(finalSectionLayouts.footer, footerClassName)}>
          {sections.footer.map(module => (
            <ModuleRenderer
              key={`footer-${module.id}`}
              module={module}
            />
          ))}
        </footer>
      )}

      {/* Other modules that don't fit in any section */}
      {sections.other?.length > 0 && (
        <div className="w-full">
          {sections.other.map(module => (
            <ModuleRenderer
              key={`other-${module.id}`}
              module={module}
            />
          ))}
        </div>
      )}
    </div>
  );
}