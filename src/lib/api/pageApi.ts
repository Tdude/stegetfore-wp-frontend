// src/lib/api/pageApi.ts
import { fetchApi } from "./baseApi";
import { Page, LocalPage } from "@/lib/types";
import {
  adaptWordPressPage,
  adaptWordPressPageToLocalPage,
} from "@/lib/adapters/pageAdapter";

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
    includeModules?: boolean;
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
      includeModules = false,
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

    return pages.map((page) => adaptWordPressPage(page));
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

/**
 * Fetch a single page by slug
 * @param slug The page slug
 * @param includeModules Whether to include modules in the response
 * @returns A LocalPage object or null if not found
 */
export async function fetchPage(
  slug: string,
  includeModules = true
): Promise<LocalPage | null> {
  try {
    // Cache individual pages for 20 minutes
    const pages = await fetchApi(`/wp/v2/pages?slug=${slug}&_embed`, {
      revalidate: 1200,
    });

    if (!Array.isArray(pages) || pages.length === 0) {
      return null;
    }

    const page = pages[0];
    
    // The adaptWordPressPageToLocalPage function now handles modules directly
    // from the WordPress REST API response, so no separate call is needed
    return adaptWordPressPageToLocalPage(page);
  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch a page by ID
 * @param id The page ID
 * @param includeModules Whether to include modules in the response
 * @returns A Page object or null if not found
 */
export async function fetchPageById(
  id: number,
  includeModules = true
): Promise<Page | null> {
  try {
    // Cache individual pages for 20 minutes
    const page = await fetchApi(`/wp/v2/pages/${id}?_embed`, {
      revalidate: 1200,
    });

    if (!page || !page.id) {
      return null;
    }

    // Return the adapted page with modules
    return adaptWordPressPage(page);
  } catch (error) {
    console.error(`Error fetching page with ID ${id}:`, error);
    return null;
  }
}
