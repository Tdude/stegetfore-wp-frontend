import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trackUmamiEvent(event: string, data?: Record<string, unknown>) {
  if (!event) return;
  if (typeof window === "undefined") return;

  try {
    window.umami?.track?.(event, data);
  } catch {
    // no-op
  }
}

/**
 * Recursively normalizes backslashes in any string property of an object
 * This prevents the compounding escaping issue when saving repeatedly in WordPress
 */
export function normalizeBackslashes<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Use a regex that matches exactly one backslash followed by a quotation mark
    // and replace with just the quotation mark
    return obj.replace(/\\(["'\\])/g, "$1") as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeBackslashes(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = normalizeBackslashes((obj as Record<string, unknown>)[key]);
      }
    }
    return result as unknown as T;
  }

  return obj;
}

/**
 * Safely extracts text content from WordPress rendered fields
 * @param field The field which might be a string or {rendered: string}
 * @returns The text content
 */
export function getRenderedContent(
  field: string | { rendered: string } | undefined
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (field.rendered) return field.rendered;
  return "";
}

// Helper function to clean WordPress HTML content
export function cleanWordPressContent(content: string): string {
  if (!content) return "";

  // Remove WordPress comments
  const withoutComments = content.replace(/<!--[\s\S]*?-->/g, "");

  // Remove wp paragraph wrappers but keep the content
  const cleanedContent = withoutComments
    .replace(/<p>([\s\S]*?)<\/p>/g, "$1")
    .trim();

  return cleanedContent;
}

/**
 * Creates a style object for module backgrounds that respects dark mode
 * @param backgroundColor The background color from WordPress admin
 * @param darkModeColor Optional override color for dark mode (defaults to surface-secondary)
 * @returns A style object with CSS variables for both light and dark modes
 */
export function getModuleBackgroundStyle(backgroundColor?: string, darkModeColor?: string): React.CSSProperties {
  if (!backgroundColor) return {};
  
  // Create a style with CSS variables that can be overridden in dark mode
  return {
    // Use CSS variables for background color to support dark mode override
    '--module-bg-color': backgroundColor,
    // Custom property for dark mode background
    '--module-dark-bg-color': darkModeColor || 'hsl(var(--surface-secondary))',
    // The actual background color will be set via CSS using the variables
    backgroundColor: 'var(--module-bg-color)',
  } as React.CSSProperties;
}
