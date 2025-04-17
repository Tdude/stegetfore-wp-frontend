// src/components/debug/DebugPanel.tsx
'use client';

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
  // Always call hooks at the top level
  const [isOpen, setIsOpen] = React.useState(false);
  const [endpoints, setEndpoints] = React.useState<string[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = React.useState(false);
  const [endpointError, setEndpointError] = React.useState<string | null>(null);
  const [fallbackEndpoints, setFallbackEndpoints] = React.useState<string[]>([]);
  const pathname = usePathname();

  // Only check NEXT_PUBLIC_DEBUG_MODE on the client
  const [debugEnabled, setDebugEnabled] = React.useState(false);
  React.useEffect(() => {
    setDebugEnabled(process.env.NEXT_PUBLIC_DEBUG_MODE === 'true');
  }, []);

  // Helper: Recursively scan for endpoint-like URLs in an object
  function extractApiEndpoints(obj: unknown, found = new Set<string>()): Set<string> {
    if (!obj || typeof obj !== 'object') return found;
    if (Array.isArray(obj)) {
      obj.forEach(item => extractApiEndpoints(item, found));
      return found;
    }
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('/wp-json/')) {
        found.add(value);
      } else if (typeof value === 'object' && value !== null) {
        extractApiEndpoints(value, found);
      }
    });
    return found;
  }

  // Only attempt endpoint discovery once per route (not per open or data change)
  React.useEffect(() => {
    setEndpoints([]);
    setFallbackEndpoints([]);
    setEndpointError(null);
    setLoadingEndpoints(true);
    fetch('/wp-json')
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
      .catch(() => {
        // Fallback: extract from latest props (safe, since this only runs once per route)
        const found = new Set<string>();
        extractApiEndpoints(page, found);
        extractApiEndpoints(additionalData, found);
        extractApiEndpoints(providedDebugData, found);
        setFallbackEndpoints(Array.from(found));
      })
      .finally(() => setLoadingEndpoints(false));
    // Only rerun if route changes
  }, [pathname]);

  // Ref: panel container
  const panelRef = React.useRef<HTMLDivElement>(null);

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

  if (!debugEnabled) return null;

  const debugData = providedDebugData || {
    page,
    additionalData,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    },
    route: pathname,
  };

  return (
    <>
      {/* Only render DevInfoButton when debug panel is closed */}
      {!isOpen && (
        <DevInfoButton onClick={() => setIsOpen(true)} isOpen={false} />
      )}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 'min(90vw, 480px)',
            height: '100vh',
            background: '#fff',
            color: '#222',
            zIndex: 10000,
            boxShadow: '-2px 0 16px rgba(0,0,0,0.15)',
            overflowY: 'auto',
            padding: 0,
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{title}</div>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} style={{ marginLeft: 8 }}>Close</Button>
          </div>
          <div style={{ padding: '1rem' }}>
            {/* Page/Post Info */}
            {page && (
              <section style={{ marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Page/Post Info</h3>
                <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {prettyJSON(page)}
                </pre>
              </section>
            )}
            {/* Modules */}
            {page?.modules && page.modules.length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Modules</h3>
                <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {prettyJSON(page.modules)}
                </pre>
              </section>
            )}
            {/* Meta */}
            {page?.meta && (
              <section style={{ marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Meta</h3>
                <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {prettyJSON(page.meta)}
                </pre>
              </section>
            )}
            {/* Additional Debug Data */}
            {Object.keys(additionalData).length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Additional Debug Data</h3>
                <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {prettyJSON(additionalData)}
                </pre>
              </section>
            )}
            {/* Environment */}
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Environment</h3>
              <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                {prettyJSON(debugData.env)}
              </pre>
            </section>
            {/* Route */}
            {debugData.route && (
              <section style={{ marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>Route</h3>
                <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {debugData.route}
                </pre>
              </section>
            )}
            {/* Endpoints - context aware */}
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>Available Endpoints</h3>
              {loadingEndpoints && <div>Loading endpoints...</div>}
              {endpoints.length > 0 && (
                <pre className="bg-gray-100 p-2 rounded text-xs max-h-60 overflow-y-auto">
                  {endpoints.join('\n')}
                </pre>
              )}
              {endpoints.length === 0 && fallbackEndpoints.length > 0 && (
                <pre className="bg-gray-100 p-2 rounded text-xs max-h-60 overflow-y-auto">
                  {fallbackEndpoints.join('\n')}
                </pre>
              )}
              {endpoints.length === 0 && fallbackEndpoints.length === 0 && !loadingEndpoints && (
                <div className="text-xs text-gray-500">No endpoints could be discovered, but this page is rendering data successfully.</div>
              )}
            </section>
            {/* Copy to Clipboard */}
            <Button
              variant="default"
              size="sm"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(prettyJSON(debugData));
              }}
            >
              Copy All Debug Info
            </Button>
            {/* Custom Renderer */}
            {customRenderer && (
              <section style={{ marginTop: 24 }}>{customRenderer(debugData) as React.ReactNode}</section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
