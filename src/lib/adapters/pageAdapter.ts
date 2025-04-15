// src/lib/adapters/pageAdapter.ts
import { Page } from "@/lib/types";
import { LocalPage } from "@/lib/types/contentTypes";
import { adaptWordPressModules } from "./moduleAdapter";

/**
 * Type guard to check if wpPage is a WordPress page-like object
 */
function isWPPage(obj: unknown): obj is {
  id: number;
  slug: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  template?: string;
  _embedded?: unknown;
  featured_image_url?: string;
  modules?: unknown;
  acf?: unknown;
  type?: string;
} {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj && typeof (obj as { id: unknown }).id === 'number' &&
    'slug' in obj && typeof (obj as { slug: unknown }).slug === 'string'
  );
}

// Type guard for WPEmbedded
// (Move this to /types if you use it elsewhere)
type WPEmbedded = {
  "wp:featuredmedia"?: {
    source_url: string;
    alt_text?: string;
    media_details?: {
      width: number;
      height: number;
      sizes?: Record<string, { source_url: string; width: number; height: number; }>;
    };
  }[];
};

function isWPEmbedded(obj: unknown): obj is WPEmbedded {
  if (!obj || typeof obj !== "object") return false;
  if ("wp:featuredmedia" in obj) {
    return Array.isArray((obj as WPEmbedded)["wp:featuredmedia"]);
  }
  return true;
}

/**
 * Adapts a WordPress page to the application Page format
 * @param wpPage WordPress page data
 * @returns Page object formatted for the application
 */
export function adaptWordPressPage(wpPage: unknown): Page {
  // Type guard to ensure wpPage is a WordPress page-like object
  if (!isWPPage(wpPage)) {
    // Fallback to empty/default values if the structure is not as expected
    return {
      id: 0,
      slug: '',
      title: { rendered: '' },
      content: { rendered: '' },
      excerpt: undefined,
      template: 'default',
      _embedded: undefined,
      featured_image_url: undefined,
    };
  }

  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || '',
    },
    content: {
      rendered: wpPage.content?.rendered || '',
    },
    excerpt: wpPage.excerpt
      ? { rendered: wpPage.excerpt.rendered || '' }
      : undefined,
    template: wpPage.template || 'default',
    _embedded: isWPEmbedded(wpPage._embedded) ? wpPage._embedded : undefined,
    featured_image_url: extractFeaturedImageUrl(wpPage),
  };
}

/**
 * Adapts a WordPress page to the local page format
 * @param wpPage WordPress page response
 * @returns LocalPage object formatted for the application
 */
export function adaptWordPressPageToLocalPage(wpPage: unknown): LocalPage {
  // Type guard to ensure wpPage is a WordPress page-like object
  if (!isWPPage(wpPage)) {
    console.error('Cannot adapt null, undefined, or invalid WordPress page');
    return {
      id: 0,
      slug: '',
      title: { rendered: '' },
      content: { rendered: '' },
      modules: [],
    };
  }

  // Debug the source WordPress page
  console.log(`[pageAdapter] Mapping WordPress page to LocalPage:`, {
    id: wpPage.id,
    slug: wpPage.slug,
    hasModulesFromWP: !!wpPage.modules,
    moduleType: wpPage.modules ? typeof wpPage.modules : 'undefined',
    isModulesArray: Array.isArray(wpPage.modules),
    moduleCount: Array.isArray(wpPage.modules) ? wpPage.modules.length : 0,
    firstModuleFromWP: Array.isArray(wpPage.modules) && wpPage.modules.length > 0 ? 
      { id: wpPage.modules[0].id, title: wpPage.modules[0].title } : null
  });

  // Extract modules with standardized approach for all pages
  const adaptedModules = adaptWordPressModules(extractModulesFromWordPressPage(wpPage));
  
  // Create a local page object with all necessary properties
  const localPage: LocalPage = {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || ""
    },
    content: {
      rendered: wpPage.content?.rendered || ""
    },
    excerpt: wpPage.excerpt ? {
      rendered: wpPage.excerpt.rendered || ""
    } : undefined,
    modules: adaptedModules,
    type: wpPage.type || "",
    template: wpPage.template || "default"
  };

  // Debug the resulting LocalPage
  console.log(`[pageAdapter] LocalPage after mapping:`, {
    id: localPage.id,
    slug: localPage.slug,
    hasModulesInLocalPage: !!localPage.modules,
    isModulesArrayInLocalPage: Array.isArray(localPage.modules),
    moduleCountInLocalPage: Array.isArray(localPage.modules) ? localPage.modules.length : 0,
    firstModuleInLocalPage: Array.isArray(localPage.modules) && localPage.modules.length > 0 ? 
      { id: localPage.modules[0].id, title: localPage.modules[0].title } : null
  });

  console.log(`Adapted page "${wpPage.slug}" with ${adaptedModules.length} modules`);
  
  return localPage;
}

/**
 * Extracts featured image URL from WordPress page
 * @param wpPage WordPress page data
 * @returns Featured image URL or undefined if not present
 */
function extractFeaturedImageUrl(wpPage: unknown): string | undefined {
  if (!isWPPage(wpPage)) return undefined;
  // Check for featured_media property
  const hasFeaturedMedia = typeof wpPage === 'object' && wpPage !== null && 'featured_media' in wpPage;
  if (!hasFeaturedMedia || typeof (wpPage as { featured_media?: unknown }).featured_media !== 'number') return undefined;

  // Check for _embedded property and wp:featuredmedia array
  const embedded = wpPage._embedded;
  if (
    embedded &&
    typeof embedded === 'object' &&
    'wp:featuredmedia' in embedded &&
    Array.isArray((embedded as Record<string, unknown>)["wp:featuredmedia"]) &&
    (embedded as Record<string, unknown[]>)["wp:featuredmedia"].length > 0
  ) {
    const media = (embedded as Record<string, unknown[]>)["wp:featuredmedia"][0];
    if (media && typeof media === 'object' && 'source_url' in media && typeof (media as { source_url?: unknown }).source_url === 'string') {
      return (media as { source_url: string }).source_url;
    }
  }
  return undefined;
}

/**
 * Extract modules from a WordPress page response
 * This function uses a systematic approach to check multiple possible locations
 * where module data might be stored in the WordPress REST API response
 * @param wpPage WordPress page data
 * @returns Array of modules
 */
export function extractModulesFromWordPressPage(wpPage: unknown): unknown[] {
  if (!isWPPage(wpPage)) {
    console.error('Cannot extract modules from null or undefined WordPress page');
    return [];
  }
  // Check for modules property
  if ('modules' in wpPage && Array.isArray((wpPage as { modules?: unknown }).modules)) {
    return (wpPage as { modules: unknown[] }).modules;
  }
  return [];
}

/**
 * Adapts multiple WordPress pages to the application Page format
 * @param wpPages Array of WordPress page data
 * @returns Array of Page objects formatted for the application
 */
export function adaptWordPressPages(wpPages: unknown[]): Page[] {
  if (!Array.isArray(wpPages)) {
    console.warn("adaptWordPressPages: expected array but got", typeof wpPages);
    return [];
  }
  
  return wpPages.map(adaptWordPressPage);
}
