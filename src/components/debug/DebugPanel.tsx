'use client';

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LocalPage } from '@/lib/types/contentTypes';

interface DebugPanelProps {
  title?: string;
  // Option to just pass the page object directly
  page?: any;
  // Optional additional data to include in debugging
  additionalData?: Record<string, any>;
  // For backward compatibility, can still provide fully prepared debug data
  debugData?: Record<string, any>;
  // Optional custom renderer for specific data types
  customRenderer?: (data: Record<string, any>) => React.ReactNode;
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
  const debugData = providedDebugData || prepareDebugData(page, additionalData);

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
function prepareDebugData(page: any, additionalData: Record<string, any> = {}): Record<string, any> {
  if (!page) {
    return {
      'Error': 'No page data provided',
      ...additionalData
    };
  }

  // Extract basic page data with defensive checks
  const pageId = page.id || 'Unknown';
  const template = page.template ? formatTemplateName(page.template) : 'Default';
  const title = page.title?.rendered || page.title || 'Unknown';
  const hasContent = Boolean(page.content?.rendered || page.content);
  const contentLength = (page.content?.rendered || page.content || '').length;
  const hasFeaturedImage = Boolean(page.featured_image_url || (page._embedded && page._embedded['wp:featuredmedia']));
  const modulesCount = Array.isArray(page.modules) ? page.modules.length : 0;
  const slug = page.slug || 'Unknown';
  
  // Create module type count
  let moduleTypes: Record<string, number> = {};
  if (Array.isArray(page.modules)) {
    moduleTypes = page.modules.reduce((acc: Record<string, number>, module: any) => {
      if (module.type) {
        acc[module.type] = (acc[module.type] || 0) + 1;
      }
      return acc;
    }, {});
  }

  // Calculate which module sections are present
  const moduleSections = {
    header: 0,
    main: 0,
    other: 0,
    footer: 0
  };

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
