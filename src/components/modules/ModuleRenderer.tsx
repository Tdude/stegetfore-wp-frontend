// src/components/modules/ModuleRenderer.tsx
'use client';

import React, { Suspense, lazy, ReactNode } from 'react';
import { Module } from '@/lib/types/moduleTypes';
import { cn } from '@/lib/utils';
import {
  isHeroModule,
  isCTAModule,
  isSellingPointsModule,
  isTestimonialsModule,
  isFeaturedPostsModule,
  isStatsModule,
  isGalleryModule,
  isTextModule,
  isFormModule,
  isAccordionModule,
  isTabsModule,
  isVideoModule,
  isChartModule
} from '@/lib/typeGuards';

// Import basic placeholder components
import ModulePlaceholder from './ModulePlaceholder';
import ModuleErrorBoundary from './ModuleErrorBoundary';

// Create a safer dynamic import function
const safeImport = (modulePath: string, fallbackComponent: ReactNode = null) => {
  return lazy(() =>
    import(`./${modulePath}`)
      .catch((err: Error) => {
        console.warn(`Module ${modulePath} could not be loaded:`, err.message);
        // Return a minimal component that won't break rendering
        return {
          default: ({ module }: { module: Module }) => (
            <div className="p-4 border border-yellow-200 rounded bg-yellow-50">
              <h3 className="font-semibold text-yellow-800">{module.type} Module</h3>
              {module.title && <p className="mt-2">{module.title}</p>}
              {module.content && (
                <div className="mt-2 prose prose-sm" dangerouslySetInnerHTML={{ __html: module.content }} />
              )}
              <p className="mt-4 text-xs text-yellow-700">
                This is a placeholder. The actual module component is not yet available.
              </p>
            </div>
          )
        };
      })
  );
};

// Safely load module components
const TextModule = safeImport('TextModule');
const HeroModule = safeImport('HeroModule');
const CTAModule = safeImport('CTAModule');
const SellingPointsModule = safeImport('SellingPointsModule');
const TestimonialsModule = safeImport('TestimonialsModule');
const FeaturedPostsModule = safeImport('FeaturedPostsModule');
const StatsModule = safeImport('StatsModule');
const GalleryModule = safeImport('GalleryModule');
const FormModule = safeImport('FormModule');
const AccordionModule = safeImport('AccordionModule');
const TabsModule = safeImport('TabsModule');
const VideoModule = safeImport('VideoModule');
const ChartModule = safeImport('ChartModule');

interface ModuleRendererProps {
  module: Module;
  className?: string;
}

export default function ModuleRenderer({ module, className }: ModuleRendererProps) {
  // Early return if no module provided
  if (!module) {
    return null;
  }

  // Try/catch block for module type checking to provide helpful errors
  try {
    // Make sure module has a type
    if (!module.type) {
      throw new Error('Module is missing required "type" property');
    }

    // Output module type to data attribute for debugging
    const moduleTypeAttr = `module-${module.type}`;

    // Render different components based on module type
    const renderModuleContent = () => {
      // Use Suspense to handle lazy-loaded components
      return (
        <Suspense fallback={<ModulePlaceholder type={module.type} />}>
          <ModuleErrorBoundary type={module.type}>
            {(() => {
              // Use type guards to properly type each module
              if (isHeroModule(module)) {
                return <HeroModule module={module} />;
              } else if (isCTAModule(module)) {
                return <CTAModule module={module} />;
              } else if (isSellingPointsModule(module)) {
                return <SellingPointsModule module={module} />;
              } else if (isTestimonialsModule(module)) {
                return <TestimonialsModule module={module} />;
              } else if (isFeaturedPostsModule(module)) {
                return <FeaturedPostsModule module={module} />;
              } else if (isStatsModule(module)) {
                return <StatsModule module={module} />;
              } else if (isGalleryModule(module)) {
                return <GalleryModule module={module} />;
              } else if (isTextModule(module)) {
                return <TextModule module={module} />;
              } else if (isFormModule(module)) {
                return <FormModule module={module} />;
              } else if (isAccordionModule(module)) {
                return <AccordionModule module={module} />;
              } else if (isTabsModule(module)) {
                return <TabsModule module={module} />;
              } else if (isVideoModule(module)) {
                return <VideoModule module={module} />;
              } else if (isChartModule(module)) {
                return <ChartModule module={module} />;
              } else {
                // Fallback for unknown module types
                return (
                  <div className="p-4 border border-yellow-200 rounded bg-yellow-50">
                    <h3 className="font-medium text-yellow-800">Unknown Module Type: {module.type}</h3>
                    {module.title && <p className="mt-2 text-yellow-700">Title: {module.title}</p>}
                    {module.content && (
                      <div
                        className="mt-2 prose-sm max-w-none text-yellow-700"
                        dangerouslySetInnerHTML={{ __html: module.content }}
                      />
                    )}
                  </div>
                );
              }
            })()}
          </ModuleErrorBoundary>
        </Suspense>
      );
    };

    // Render module with wrapper div and appropriate classes
    return (
      <div
        className={cn(
          'module',
          moduleTypeAttr,
          className
        )}
        data-module-id={module.id}
        data-module-type={module.type}
      >
        {renderModuleContent()}
      </div>
    );
  } catch (error: unknown) {
    // Handle any runtime errors
    console.error('Error rendering module:', error);
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <h3 className="font-medium text-red-800">Module Rendering Error</h3>
        <p className="mt-2 text-red-700">{(error as Error).message}</p>
      </div>
    );
  }
}