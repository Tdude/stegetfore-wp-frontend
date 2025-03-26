import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Recursively normalizes backslashes in any string property of an object
 * This prevents the compounding escaping issue when saving repeatedly in WordPress
 */
export function normalizeBackslashes(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Use a regex that matches exactly one backslash followed by a quotation mark
    // and replace with just the quotation mark
    return obj.replace(/\\(["'\\])/g, "$1");
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeBackslashes(item));
  }

  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = normalizeBackslashes(obj[key]);
      }
    }
    return result;
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
