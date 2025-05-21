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

import { usePathname } from 'next/navigation';
import LoadingDots from '../ui/LoadingDots';

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
function extractApiEndpoints(obj: Record<string, unknown>, found = new Set<string>()): Set<string> {
  if (!obj || typeof obj !== 'object') return found;
  if (Array.isArray(obj)) {
    obj.forEach(item => extractApiEndpoints(item, found));
    return found;
  }
  Object.entries(obj).forEach(([, value]) => {
    if (typeof value === 'string' && value.startsWith('/wp-json/')) {
      found.add(value);
    } else if (typeof value === 'object' && value !== null) {
      extractApiEndpoints(value as Record<string, unknown>, found);
    }
  });
  return found;
}

/**
 * Floating Dev Info Button
 * Always visible, toggles panel open/close, label changes with isOpen
 */
function DevInfoButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      aria-label={isOpen ? 'Close debug panel' : 'Open debug panel'}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[10001] px-6 py-2 rounded min-w-[80px] h-10 w-12 font-semibold flex items-center justify-center bg-secondary text-secondary-foreground shadow-md transition-colors border border-yellow-500 bg-yellow-50"
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

  // Use stringified versions of debug objects as dependencies to avoid infinite loops
  const stringifiedProvidedDebugData = JSON.stringify(providedDebugData);
  const stringifiedAdditionalData = JSON.stringify(additionalData);
  const stringifiedPage = JSON.stringify(page);


  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setLoadingEndpoints(true);
    setEndpointError(null);
    try {
      const allData = {
        ...providedDebugData,
        ...additionalData,
        ...(page ? { page: page as unknown as Record<string, unknown> } : {})
      };
      const found = extractApiEndpoints(allData);
      setEndpoints(Array.from(found));
      setFallbackEndpoints(Array.from(found));
    } catch {
      setEndpointError('Could not extract API endpoints');
    } finally {
      setLoadingEndpoints(false);
    }
  }, [
    pathname, 
    stringifiedProvidedDebugData,
    stringifiedAdditionalData,
    stringifiedPage
  ]);

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

  // Helper to render key-value pairs in a responsive grid (mimic your clean panel)
  function renderDebugGrid(data: Record<string, unknown>) {
    if (!data || typeof data !== 'object') return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col mb-1">
            <span className="font-semibold text-yellow-800">{key}:</span>
            <span className="text-yellow-700 break-all">
              {typeof value === 'object' && value !== null ? (
                <pre className="bg-gray-50 rounded p-1 overflow-x-auto max-w-xs max-h-32">{prettyJSON(value)}</pre>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Helper: extract quick-view API fields from debugData
  const QUICK_VIEW_KEYS = [
    'Current Path', 'Page ID', 'Post ID', 'Title', 'Slug', 'Type', 'Page Type', 'Date', 'Has Content', 'Content Length', 'Featured Image', 'Has Featured Image', 'Modules Count', 'Module Types', 'Categories', 'Categories Count'
  ];

  function getQuickViewFields(data: Record<string, unknown>) {
    if (!data) return [];
    // Try to support both buildPageDebugData and buildPostDebugData shapes
    return [
      { label: 'Current Path', value: pathname },
      { label: 'Page ID', value: data['Page ID'] ?? data['id'] },
      { label: 'Post ID', value: data['Post ID'] },
      { label: 'Title', value: data['Title'] ?? data['title'] },
      { label: 'Slug', value: data['Slug'] ?? data['slug'] },
      { label: 'Type', value: data['Page Type'] ?? data['type'] },
      { label: 'Date', value: data['Date'] ?? data['date'] },
      { label: 'Has Content', value: data['Has Content'] !== undefined ? String(data['Has Content']) : undefined },
      { label: 'Content Length', value: data['Content Length'] },
      { label: 'Featured Image', value: data['Featured Image'] },
      { label: 'Has Featured Image', value: data['Has Featured Image'] },
      { label: 'Modules Count', value: Array.isArray(data['modules']) ? data['modules'].length : undefined },
      { label: 'Module Types', value: Array.isArray(data['modules']) ? safeJoin(data['modules'].map((m: Record<string, unknown>) => m.type)) : undefined },
      { label: 'Categories', value: data['Categories'] ?? data['categories'] ?? data['Categories Count'] },
    ].filter(f => f.value !== undefined && f.value !== '');
  }

  // Remove quick view keys from debug grid
  function getGridFields(data: Record<string, unknown>) {
    if (!data) return {};
    const quickLabels = new Set(QUICK_VIEW_KEYS.concat(['id', 'modules', 'categories', 'title', 'slug', 'type', 'pageType', 'date']));
    // Remove quick view keys and their alternate spellings
    return Object.fromEntries(Object.entries(data).filter(([key]) => !quickLabels.has(key)));
  }

  // Helper to safely format values for display in QuickView
  function formatQuickValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      // Special case: WP REST API fields like { rendered: string }
      if ('rendered' in (value as Record<string, unknown>) && typeof (value as Record<string, unknown>).rendered === 'string') {
        return (value as Record<string, unknown>).rendered;
      }
      if (Array.isArray(value)) {
        return safeJoin(value);
      }
      // Fallback: JSON for other objects
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }

  // Helper to safely join arrays of unknown
  function safeJoin(arr: unknown[]): string {
    return arr.map(String).join(', ');
  }

  // Quick view component
  function QuickView({ data }: { data: Record<string, unknown> }) {
    const fields = getQuickViewFields(data);
    if (!fields.length) return null;
    return (
      <div className="mb-4 p-3 bg-yellow-100 rounded border border-yellow-300">
        {fields.map(f => (
          <div key={f.label} className="flex flex-row gap-2 text-sm mb-1">
            <span className="font-semibold text-yellow-900 w-40">{f.label}:</span>
            <span className="text-yellow-800 break-all">{formatQuickValue(f.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Collapsible Raw Debug Data section
  function RawDebugData({ data }: { data: unknown }) {
    const [open, setOpen] = React.useState(false);
    return (
      <details className="mt-4" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
        <summary className="cursor-pointer text-yellow-800 hover:text-yellow-900 font-semibold">View Raw Debug Data</summary>
        <pre className="mt-2 p-2 bg-gray-800 text-white text-xs overflow-auto rounded h-60">
          {prettyJSON(data)}
        </pre>
      </details>
    );
  }

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
      <div ref={panelRef} className="fixed inset-0 z-[10000] flex items-end justify-end pointer-events-none">
        <div className={`m-6 w-full max-w-2xl bg-white border border-yellow-500 rounded shadow-lg pointer-events-auto p-6 relative overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          {endpointError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>API Endpoint Discovery Error</AlertTitle>
              <AlertDescription>
                {endpointError}
              </AlertDescription>
            </Alert>
          )}
          {/* Quick view summary of API fields */}
          <QuickView data={debugData} />
          {/* Render debug grid for remaining fields only */}
          <div className="overflow-x-auto max-h-[50vh] text-xs bg-gray-50 p-2 rounded mb-2">
            {customRenderer ? customRenderer(debugData) : (
              debugData && typeof debugData === 'object' && Object.keys(getGridFields(debugData)).length > 0 ? (
                renderDebugGrid(getGridFields(debugData))
              ) : (
                <pre>{prettyJSON(debugData)}</pre>
              )
            )}
            {loadingEndpoints && (
              <div className="mt-2 text-yellow-700 text-xs">
                <LoadingDots text="Loading endpoints" dotsClassName="text-yellow-700" />
              </div>
            )}
            <RawDebugData data={debugData} />
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
    </>
  );
}
