// src/components/debug/DebugPanel.tsx
'use client';

/**
 * DEBUG LOG NOTICE:
 * The DebugPanel fetches /wp-json to discover available API endpoints for debugging.
 * To prevent side effects, this fetch is always done using the native window.fetch API,
 * and is isolated from any global data loaders, react-query, SWR, or custom fetch wrappers.
 * This ensures that no part of the app treats /wp-json as a page slug or triggers unwanted loaders.
 *
 * If you change how endpoint discovery works, ensure this isolation is preserved.
 */

export const DEBUG_PANEL_ENABLED = true;

import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { usePathname } from 'next/navigation';

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
  page?: PageData;
  additionalData?: Record<string, unknown>;
  debugData?: Record<string, unknown>;
  customRenderer?: (data: Record<string, unknown>) => React.ReactNode;
}

function prettyJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2);
}

// Move extractApiEndpoints OUTSIDE the component to avoid re-creation on every render
function extractApiEndpoints(obj: unknown, found = new Set<string>()): Set<string> {
  if (!obj || typeof obj !== 'object') return found;
  if (Array.isArray(obj)) {
    obj.forEach(item => extractApiEndpoints(item, found));
    return found;
  }
  Object.entries(obj).forEach(([, value]) => {
    if (typeof value === 'string' && value.startsWith('/wp-json/')) {
      found.add(value);
    } else if (typeof value === 'object' && value !== null) {
      extractApiEndpoints(value, found);
    }
  });
  return found;
}

// Helper to get API root from env
function getApiRoot() {
  if (typeof window !== 'undefined') {
    // On the client, use window env if available
    // @ts-expect-error - window is not defined in server-side rendering
    return window.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/wp-json';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/wp-json';
}

/**
 * Floating Dev Info Button
 */
function DevInfoButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      aria-label={isOpen ? 'Close debug panel' : 'Open debug panel'}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[10001] px-6 py-2 rounded min-w-[80px] h-10 font-semibold flex items-center justify-center bg-secondary text-secondary-foreground shadow-md transition-colors hover:bg-secondary/80 border border-yellow-500 bg-yellow-50"
      type="button"
    >
      {isOpen ? 'Close' : 'Debug'}
    </button>
  );
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
  // --- All hooks must be called at the top level, unconditionally ---
  const [isOpen, setIsOpen] = React.useState(false);
  const [endpoints, setEndpoints] = React.useState<string[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = React.useState(false);
  const [endpointError, setEndpointError] = React.useState<string | null>(null);
  const [fallbackEndpoints, setFallbackEndpoints] = React.useState<string[]>([]);
  const pathname = usePathname();
  const [debugEnabled, setDebugEnabled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDebugEnabled(process.env.NEXT_PUBLIC_DEBUG_MODE === 'true');
    setMounted(true);
  }, []);

  // Only attempt endpoint discovery once per route (not per open or data change)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setEndpoints([]);
    setFallbackEndpoints([]);
    setEndpointError(null);
    setLoadingEndpoints(true);
    const apiRoot = getApiRoot();
    window.fetch(apiRoot)
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response was not JSON. Received: ' + contentType);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.routes) {
          setEndpoints(Object.keys(data.routes));
        } else {
          setEndpointError('No routes found in /wp-json response.');
        }
      })
      .catch((error) => {
        setEndpointError('Failed to fetch /wp-json: ' + (error?.message || error));
        // Fallback: extract from latest props (safe, since this only runs once per route)
        const found = new Set<string>();
        extractApiEndpoints(page, found);
        extractApiEndpoints(additionalData, found);
        extractApiEndpoints(providedDebugData, found);
        setFallbackEndpoints(Array.from(found).filter(ep => ep !== '/wp-json'));
      })
      .finally(() => setLoadingEndpoints(false));
  }, [pathname]);

  // Add Escape key to close
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // --- Only render UI after all hooks ---
  if (!DEBUG_PANEL_ENABLED || !debugEnabled || !mounted) return null;

  const debugData = providedDebugData || {
    page,
    additionalData
  };

  // Collapsible list component
  function CollapsibleList({ title, items }: { title: string; items: string[] }) {
    const [open, setOpen] = React.useState(false);
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-2">
        <button
          className="w-full text-left font-semibold text-sm bg-yellow-100 border border-yellow-400 rounded px-2 py-1 mb-1 hover:bg-yellow-200 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? '▼' : '▶'} {title}
        </button>
        {open && (
          <ul className="max-h-40 overflow-y-auto bg-white border border-yellow-100 rounded p-2 text-xs">
            {items.map((ep) => (
              <li key={ep} className="break-all py-0.5">{ep}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Show endpoint error if present
  // Use Alert UI to display error and fallback endpoints
  return (
    <>
      <DevInfoButton onClick={() => setIsOpen((v) => !v)} isOpen={isOpen} />
      {isOpen && (
        <div ref={panelRef} className="fixed inset-0 z-[10000] flex items-end justify-end pointer-events-none">
          <div className="m-6 w-full max-w-2xl bg-white border border-yellow-500 rounded shadow-lg pointer-events-auto p-6 relative overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">{title}</h2>
              <Button onClick={() => setIsOpen(false)} size="sm" variant="outline">Close</Button>
            </div>
            {endpointError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>API Endpoint Discovery Error</AlertTitle>
                <AlertDescription>
                  {endpointError}
                </AlertDescription>
              </Alert>
            )}
            <div className="overflow-x-auto max-h-[50vh] text-xs bg-gray-50 p-2 rounded mb-2">
              {customRenderer ? customRenderer(debugData) : (
                <pre>{prettyJSON(debugData)}</pre>
              )}
              {loadingEndpoints && (
                <div className="mt-2 text-yellow-700 text-xs">
                  <strong>Loading endpoints...</strong>
                </div>
              )}
            </div>
            {/* Collapsible lists for endpoints */}
            <CollapsibleList
              title="Discovered API Endpoints"
              items={endpoints}
            />
            {endpointError && fallbackEndpoints.length > 0 && (
              <CollapsibleList
                title="Endpoints found in data"
                items={fallbackEndpoints}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
