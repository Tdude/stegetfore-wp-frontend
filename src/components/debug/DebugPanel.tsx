'use client';

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Define a more specific type for page data
interface PageData {
  id?: number;
  title?: string | { rendered: string };
  content?: string | { rendered: string };
  slug?: string;
  template?: string;
  featured_image_url?: string;
  _embedded?: Record<string, unknown>;
  modules?: Array<ModuleData>;
  show_content_with_modules?: boolean;
  meta?: Record<string, unknown>;
}

// Define a type for module data
interface ModuleData {
  type: string;
  [key: string]: unknown;
}

interface DebugPanelProps {
  title?: string;
  // Replaced any with PageData
  page?: PageData;
  // Replaced any with unknown for better type safety
  additionalData?: Record<string, unknown>;
  // For backward compatibility, can still provide fully prepared debug data
  debugData?: Record<string, unknown>;
  // Optional custom renderer for specific data types
  customRenderer?: (data: Record<string, unknown>) => React.ReactNode;
}

/**
 * Reusable debugging panel component that can be added to any page/template
 * Only appears when NEXT_PUBLIC_DEBUG_MODE=true
 */
export default function DebugPanel({ 
  title = "Debug Information",
  page,
  additionalData = {},
  debugData: providedDebugData,
  customRenderer
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

  if (!debugEnabled) return null;

  // If debug data is directly provided, use that
  // Otherwise, generate it from the page object
  const debugData = providedDebugData || (page ? prepareDebugData(page, additionalData) : { 'Error': 'No page data provided', ...additionalData });

  return (
    <div className="debug-panel mt-12 mb-4 border-t-2 border-gray-200 pt-4">
      {/* Debug toggle button */}
      <div className="container mx-auto px-4">
        <Button 
          onClick={() => setIsOpen(!isOpen)} 
          variant="outline"
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300"
        >
          {isOpen ? "Close" : "Debug"}
        </Button>
      </div>

      {/* Debug panel */}
      {isOpen && (
        <div className="container mx-auto mt-4 px-4">
          <Alert className="bg-white border mb-4">
            <AlertTitle className="text-xl font-bold">
              {title}
              {page?.template && (
                <span className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded">
                  {formatTemplateName(page.template)}
                </span>
              )}
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-4">
                {/* Custom renderer takes precedence */}
                {customRenderer ? (
                  customRenderer(debugData)
                ) : (
                  <div className="space-y-2 text-sm">
                    {/* Default renderer for key-value pairs */}
                    {Object.entries(debugData).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong>{' '}
                        {typeof value === 'object' 
                          ? <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded mt-1">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          : String(value)
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setIsOpen(false)} variant="outline">Close</Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

/**
 * Formats a template name from the WP template path
 */
function formatTemplateName(templatePath: string): string {
  if (!templatePath) return 'Default';
  
  // Extract just the filename without extension
  const match = templatePath.match(/templates\/([^.]+)\.php$/);
  if (match && match[1]) {
    // Convert kebab-case to Title Case
    return match[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Template';
  }
  
  return templatePath;
}

/**
 * Prepares standard debug data from a page object
 */
function prepareDebugData(page: PageData, additionalData: Record<string, unknown> = {}): Record<string, unknown> {
  if (!page) {
    return {
      'Error': 'No page data provided',
      ...additionalData
    };
  }

  // Extract basic page data with defensive checks
  const pageId = page.id || 'Unknown';
  const template = page.template ? formatTemplateName(page.template) : 'Default';
  
  // Fix type errors with proper type guards
  const title = typeof page.title === 'object' && page.title?.rendered 
    ? page.title.rendered 
    : (typeof page.title === 'string' ? page.title : 'Unknown');
    
  const hasContent = Boolean(
    typeof page.content === 'object' && page.content?.rendered 
    || typeof page.content === 'string' && page.content
  );
  
  const contentLength = (
    typeof page.content === 'object' && page.content?.rendered 
      ? page.content.rendered 
      : (typeof page.content === 'string' ? page.content : '')
  ).length;
  
  const hasFeaturedImage = Boolean(page.featured_image_url || (page._embedded && page._embedded['wp:featuredmedia']));
  const modulesCount = Array.isArray(page.modules) ? page.modules.length : 0;
  const slug = page.slug || 'Unknown';
  
  // Create module type count
  let moduleTypes: Record<string, number> = {};
  if (Array.isArray(page.modules)) {
    moduleTypes = page.modules.reduce((acc: Record<string, number>, module: ModuleData) => {
      if (module.type) {
        acc[module.type] = (acc[module.type] || 0) + 1;
      }
      return acc;
    }, {});
  }

  // Try to extract meta information with defensive coding
  const meta = page.meta || {};
  const contentPosition = meta.content_position || 'before';
  const showContentWithModules = typeof page.show_content_with_modules === 'boolean' 
    ? page.show_content_with_modules 
    : true;

  // Build a standardized debug data object
  const debugData = {
    'Page ID': pageId,
    'Template': template,
    'Title': title,
    'Has Content': hasContent,
    'Content Length': contentLength,
    'Featured Image': hasFeaturedImage ? 'Yes' : 'None',
    'Modules Count': modulesCount,
    'Show Content With Modules': showContentWithModules ? 'Yes' : 'No',
    'Content Position': contentPosition,
    'Module Types': Object.keys(moduleTypes).length > 0 ? moduleTypes : 'None',
    'Slug': slug,
    ...additionalData
  };

  return debugData;
}
