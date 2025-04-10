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

// Simple error boundary component
interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Module render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

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
  module: Module & { template?: string };
  className?: string;
}

export default function ModuleRenderer({ module, className }: ModuleRendererProps) {
  // Debug logging to trace what modules are being received
  console.log('ModuleRenderer received:', { 
    moduleExists: !!module,
    moduleType: module?.type,
    moduleId: module?.id,
    moduleKeys: module ? Object.keys(module) : []
  });
  
  // Early return with a placeholder if no module provided
  if (!module) {
    console.warn('ModuleRenderer called with no module');
    return (
      <div className="w-full p-4 bg-gray-100 text-gray-400 text-center">
        Module data not available
      </div>
    );
  }

  const moduleType = module.type || 'unknown';
  const moduleId = module.id || 'no-id';
  const isFullWidth = module.fullWidth === true;

  // Log module details
  console.log(`ModuleRenderer for ${moduleType} (ID: ${moduleId})`, module);

  // Add fullWidth class if needed
  const moduleClasses = cn(
    'module',
    `module-${moduleType}`,
    isFullWidth ? 'w-full' : '',
    className
  );

  try {
    // Template as fallback if type is missing
    if (!module.type && module.template) {
      module.type = module.template;
    }

    // Still no type after fallback attempt
    if (!module.type) {
      throw new Error('Module is missing required "type" property');
    }

    // Output module type to data attribute for debugging
    const moduleTypeAttr = `module-${module.type}`;

    // Render different components based on module type
    const renderModuleContent = () => {
      if (!module) return null;
      
      console.log(`Rendering module: ${module.type} (ID: ${module.id})`);
      
      // Match based on the actual module type
      switch (module.type) {
        case 'hero':
          return <HeroModule module={module} />;
        case 'cta':
          return <CTAModule module={module} />;
        case 'selling-points':
        case 'selling_points':  // Support both formats
          return <SellingPointsModule module={module} />;
        case 'testimonials':
          return <TestimonialsModule module={module} />;
        case 'featured-posts':
        case 'featured_posts':  // Support both formats
          return <FeaturedPostsModule module={module} />;
        case 'stats':
          return <StatsModule module={module} />;
        case 'gallery':
          return <GalleryModule module={module} />;
        case 'text':
          return <TextModule module={module} />;
        case 'form':
          return <FormModule module={module} />;
        case 'accordion':
        case 'accordion-faq':
        case 'accordion_faq':  // Support all variations
        case 'faq':
          return <AccordionModule module={module} />;
        case 'tabs':
        case 'tabbed-content':
        case 'tabbed_content':  // Support all variations
          return <TabsModule module={module} />;
        case 'video':
          return <VideoModule module={module} />;
        case 'chart':
          return <ChartModule module={module} />;
        default:
          // Log unknown module types for debugging
          console.warn(`Unknown module type: ${module.type}`, module);
          
          // fallback rendering with more information
          const safeContent = module.content;

          return (
            <div className="p-4 border border-yellow-200 rounded bg-yellow-50">
              <h3 className="font-medium text-yellow-800">
                Unknown Module Type: {module.type}
              </h3>
              {module.title && (
                <p className="mt-2 text-yellow-700">
                  Title: {module.title}
                </p>
              )}
              {safeContent && (
                <div
                  className="mt-2 prose-sm max-w-none text-yellow-700"
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />
              )}
            </div>
          );
      }
    };

    // Add error boundary around each module component
    return (
      <ErrorBoundary
        fallback={
          <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded m-2">
            Error rendering module: {moduleType} (ID: {moduleId})
          </div>
        }
      >
        <div
          className={moduleClasses}
          data-module-id={moduleId}
          data-module-type={moduleType}
        >
          {renderModuleContent()}
        </div>
      </ErrorBoundary>
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