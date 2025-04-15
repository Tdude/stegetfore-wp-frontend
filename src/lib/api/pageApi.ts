// src/lib/api/pageApi.ts
import { fetchApi } from "./baseApi";
import { Page } from "@/lib/types";
import { LocalPage } from "@/lib/types/contentTypes";

/**
 * Fetch pages with optional pagination and filtering
 * @param params Optional parameters for filtering and pagination
 * @returns An array of Page objects
 */
export async function fetchPages(
  params: {
    page?: number;
    perPage?: number;
    search?: string;
    parent?: number;
    orderBy?: string;
    order?: "asc" | "desc";
  } = {}
): Promise<Page[]> {
  try {
    const {
      page = 1,
      perPage = 20,
      search,
      parent,
      orderBy = "date",
      order = "desc",
    } = params;

    // Build query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: orderBy,
      order: order,
      _embed: "true", // Always include embed data for featured images
    });

    if (search) queryParams.append("search", search);
    if (parent) queryParams.append("parent", parent.toString());

    // Cache pages for 10 minutes
    const pages = await fetchApi(`/wp/v2/pages?${queryParams.toString()}`, {
      revalidate: 600,
    });

    if (!Array.isArray(pages)) {
      console.warn(`fetchPages: expected array but got ${typeof pages}`);
      return [];
    }

    // Return the pages directly, with minimal processing
    return pages;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

/**
 * Fetch a single page by slug
 * @param slug The page slug
 * @param usePreviewToken Whether to include a preview token for draft content
 * @returns A LocalPage object or null if not found
 */
export async function fetchPage(
  slug: string,
  usePreviewToken = false
): Promise<LocalPage | null> {
  try {
    // Standard WordPress API endpoint for all pages
    const endpoint = `/wp/v2/pages?slug=${slug}&_embed`;
    
    // Make direct fetch request to get raw response
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Get the raw JSON text
    const text = await response.text();
    
    // Check if modules are in the raw response
    const hasModulesInRaw = text.includes('"modules":');
    console.log(`Raw API response ${hasModulesInRaw ? 'CONTAINS' : 'DOES NOT CONTAIN'} modules field`);
    
    // Parse JSON manually to ensure all fields are preserved
    const pages = JSON.parse(text);
    
    if (!Array.isArray(pages) || pages.length === 0) {
      console.log(`No pages found for slug: ${slug}`);
      return null;
    }
    
    // Get the first page
    const page = pages[0];
    
    // Log all top-level keys to see what's available
    console.log(`Page object keys for ${slug}:`, Object.keys(page));
    
    // Use a temporary variable to build a page object with the correct structure
    const rawPageData = {
      id: page.id,
      slug: page.slug || "",
      title: {
        rendered: page.title?.rendered || ""
      },
      content: {
        rendered: page.content?.rendered || ""
      },
      excerpt: page.excerpt ? {
        rendered: page.excerpt.rendered || ""
      } : undefined,
      modules: page.modules || [],
      type: page.type || "",
      template: page.template || "default",
      featured_image_url: page.featured_image_url || null,
      _embedded: page._embedded,
      // Get the content toggle flag - content is only shown when flag is true
      // This matches WordPress admin "Show content when modules are present" checkbox
      show_content_with_modules: page.show_content_with_modules === true || 
                              (page.meta && page.meta.show_content_with_modules === true) ||
                              false,
      // Get content position - default to 'after' if not specified
      content_position: page.content_position || 
                     (page.meta && page.meta.content_position) || 
                     'after'
    };
    
    // Cast to LocalPage to satisfy TypeScript
    const localPage = rawPageData as LocalPage;
    
    return localPage;
  } catch (error) {
    console.error(`Error fetching page "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch a page by ID
 * @param id The page ID
 * @param usePreviewToken Whether to include a preview token for draft content
 * @returns A LocalPage object or null if not found
 */
export async function fetchPageById(
  id: number,
  usePreviewToken = false
): Promise<LocalPage | null> {
  try {
    // Standard WordPress API endpoint for getting a page by ID
    const endpoint = `/wp/v2/pages/${id}?_embed`;
    
    // Fetch page data with cache disabled
    const response = await fetchApi(endpoint, {
      revalidate: 0, // No caching
    });
    
    // Handle API response standardized format
    if (!response.success || !response.data) {
      console.warn(`No page found for ID: ${id}`);
      return null;
    }
    
    const page = response.data;
    
    if (!page || !page.id) {
      console.warn(`No page found for ID: ${id}`);
      return null;
    }

    // Use a temporary variable to build a page object with the correct structure
    const rawPageData = {
      id: page.id,
      slug: page.slug || "",
      title: {
        rendered: page.title?.rendered || ""
      },
      content: {
        rendered: page.content?.rendered || ""
      },
      excerpt: page.excerpt ? {
        rendered: page.excerpt.rendered || ""
      } : undefined,
      modules: page.modules || [],
      type: page.type || "",
      template: page.template || "default",
      featured_image_url: page.featured_image_url || null,
      _embedded: page._embedded,
      // Get the content toggle flag - content is only shown when flag is true
      // This matches WordPress admin "Show content when modules are present" checkbox
      show_content_with_modules: page.show_content_with_modules === true || 
                              (page.meta && page.meta.show_content_with_modules === true) ||
                              false,
      // Get content position - default to 'after' if not specified
      content_position: page.content_position || 
                     (page.meta && page.meta.content_position) || 
                     'after'
    };
    
    // Cast to LocalPage to satisfy TypeScript
    const localPage = rawPageData as LocalPage;
    
    return localPage;
  } catch (error) {
    console.error(`Error fetching page by ID "${id}":`, error);
    return null;
  }
}
