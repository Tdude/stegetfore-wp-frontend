// src/lib/api/pageApi.ts
import { fetchApi } from "./baseApi";
import Page, { LocalPage } from "@/lib/types";
import {
  adaptWordPressPage,
  adaptWordPressPageToLocalPage,
} from "@/lib/adapters/pageAdapter";
import { fetchPageModules } from "./moduleApi";

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

    // Build query string from parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: orderBy,
      order: order,
      _embed: "true",
    });

    if (search) queryParams.append("search", search);
    if (parent !== undefined) queryParams.append("parent", parent.toString());

    // Cache pages list for 20 minutes
    const pages = await fetchApi(`/wp/v2/pages?${queryParams.toString()}`, {
      revalidate: 1200,
    });

    if (!Array.isArray(pages)) {
      return [];
    }

    // If modules are not needed, return simple pages
    if (!includeModules) {
      return pages.map((page: any) => adaptWordPressPage(page));
    }

    // If modules are needed, fetch them for each page (in parallel)
    const pagesWithModules = await Promise.all(
      pages.map(async (page: any) => {
        const modules = await fetchPageModules(page.id);
        return {
          ...adaptWordPressPage(page),
          modules,
        };
      })
    );

    return pagesWithModules;
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
// src/lib/api/pageApi.ts
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
    const adaptedPage = adaptWordPressPageToLocalPage(page);

    // If modules are not needed, return the page without modules
    if (!includeModules) {
      return adaptedPage;
    }

    // Fetch modules for this page
    const modules = await fetchPageModules(page.id);

    // Return page with modules explicitly attached
    return {
      ...adaptedPage,
      modules: modules || [], // Make sure we always return an array, even if empty
    };
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

    if (!page) {
      return null;
    }

    // If modules are not needed, return a simple page
    if (!includeModules) {
      return adaptWordPressPage(page);
    }

    // If modules are needed, fetch them
    const modules = await fetchPageModules(page.id);

    return {
      ...adaptWordPressPage(page),
      modules,
    };
  } catch (error) {
    console.error(`Error fetching page with ID ${id}:`, error);
    return null;
  }
}
