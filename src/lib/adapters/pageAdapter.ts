// src/lib/adapters/pageAdapter.ts
import { Page, LocalPage } from "@/lib/types";
// Import Module type directly from moduleTypes to avoid conflicts
import { Module } from "@/lib/types/moduleTypes";
import { getOptimalImageSize } from "@/lib/imageUtils";
import { adaptWordPressModules } from "./moduleAdapter";

/**
 * Adapts a WordPress page to the application Page format
 * @param wpPage WordPress page data
 * @returns Page object formatted for the application
 */
export function adaptWordPressPage(wpPage: any): Page {
  // Extract and ensure modules is an array if present
  const modules = extractModulesFromWordPressPage(wpPage);
                  
  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    excerpt: wpPage.excerpt ? {
      rendered: wpPage.excerpt.rendered || "",
    } : undefined,
    template: wpPage.template || "default",
    modules: modules,
    _embedded: wpPage._embedded,
    featured_media: wpPage.featured_media || 0,
    featured_image_url: extractFeaturedImageUrl(wpPage),
  };
}

/**
 * Adapts a WordPress page to the local page format
 * @param wpPage WordPress page response
 * @returns LocalPage object formatted for the application
 */
export function adaptWordPressPageToLocalPage(wpPage: any): LocalPage {
  if (!wpPage) {
    console.error('Cannot adapt null or undefined WordPress page');
    return {
      id: 0,
      slug: '',
      title: { rendered: '' },
      content: { rendered: '' },
      modules: []
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
  const modules = extractModulesFromWordPressPage(wpPage);
  
  // Adapt the modules with our standard adapter
  const adaptedModules = adaptWordPressModules(modules);
  
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
function extractFeaturedImageUrl(wpPage: any): string | undefined {
  if (!wpPage.featured_media || 
      !wpPage._embedded || 
      !wpPage._embedded["wp:featuredmedia"] || 
      !wpPage._embedded["wp:featuredmedia"][0]) {
    return undefined;
  }

  const media = wpPage._embedded["wp:featuredmedia"][0];
  return media.source_url || undefined;
}

/**
 * Extract modules from a WordPress page response
 * This function uses a systematic approach to check multiple possible locations
 * where module data might be stored in the WordPress REST API response
 * @param wpPage WordPress page data
 * @returns Array of modules
 */
export function extractModulesFromWordPressPage(wpPage: any): any[] {
  if (!wpPage) {
    console.error('Cannot extract modules from null or undefined WordPress page');
    return [];
  }

  // Debug log the raw wpPage object to see exactly what's coming from the API
  console.log('Raw WordPress page object:', {
    id: wpPage.id,
    slug: wpPage.slug,
    hasModulesProperty: wpPage.hasOwnProperty('modules'),
    modulesType: wpPage.modules ? typeof wpPage.modules : 'undefined',
    isModulesArray: Array.isArray(wpPage.modules),
    moduleCount: Array.isArray(wpPage.modules) ? wpPage.modules.length : 0
  });

  // Direct access with fallback to empty array
  return Array.isArray(wpPage.modules) ? wpPage.modules : [];
}

/**
 * Gets a nested property from an object using a path string
 * Handles both dot notation and bracket notation
 * @param obj The object to extract the property from
 * @param path The path to the property, e.g., 'acf.modules' or '_embedded["wp:meta"].modules'
 * @returns The value at the path or undefined if the path doesn't exist
 */
function getNestedProperty(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  // Check if the path has brackets (complex path)
  if (path.includes('[')) {
    // Split the path at dots that are not inside brackets
    const parts = path.split(/\.(?![^\[]*\])/);
    let current = obj;
    
    for (const part of parts) {
      if (!current) return undefined;
      
      // Handle bracket notation
      if (part.includes('[')) {
        // Extract the base part and the bracket parts
        const basePart = part.split('[')[0];
        const rest = part.substring(basePart.length);
        
        // First navigate to the base part
        current = current[basePart];
        if (!current) return undefined;
        
        // Then handle each bracket part
        const bracketParts = rest.match(/\[(.*?)\]/g);
        if (!bracketParts) continue;
        
        for (const bracketPart of bracketParts) {
          // Extract the key inside the brackets (removing quotes if present)
          let cleanPart = bracketPart.slice(1, -1).trim();
          if ((cleanPart.startsWith('"') && cleanPart.endsWith('"')) || 
              (cleanPart.startsWith("'") && cleanPart.endsWith("'"))) {
            cleanPart = cleanPart.slice(1, -1);
          }
          
          // Handle numeric indices vs string keys
          if (!isNaN(Number(cleanPart))) {
            // Use numeric index for arrays
            const numericIndex = Number(cleanPart);
            current = current[numericIndex];
          } else {
            // Use string key for objects
            current = current[cleanPart];
          }
          
          if (current === undefined || current === null) return undefined;
        }
      } else {
        // Simple property access
        current = current[part];
        if (current === undefined || current === null) return undefined;
      }
    }
    
    return current;
  }
  
  // Simple dot notation
  return path.split('.').reduce((o, i) => (o === undefined || o === null ? o : o[i]), obj);
}

/**
 * Adapts multiple WordPress pages to the application Page format
 * @param wpPages Array of WordPress page data
 * @returns Array of Page objects formatted for the application
 */
export function adaptWordPressPages(wpPages: any[]): Page[] {
  if (!Array.isArray(wpPages)) {
    console.warn("adaptWordPressPages: expected array but got", typeof wpPages);
    return [];
  }
  
  return wpPages.map(adaptWordPressPage);
}

/**
 * Extracts chart data from a WordPress page
 * @param wpPage WordPress page data
 * @returns Chart data object or undefined
 */
function extractChartData(wpPage: any): any {
  // Default empty chart data
  return wpPage.acf?.chart_data || {};
}
