// src/lib/api/siteApi.ts
import { fetchApi } from './baseApi';
import { SiteInfo, MenuItem } from '@/lib/types/contentTypes';
import { THEME_SLUG } from './baseApi';
import { adaptWordPressSiteInfo } from '@/lib/adapters/siteAdapter';

/**
 * Fetch site information
 * @returns The site information object
 */
export async function fetchSiteInfo(): Promise<SiteInfo> {
  try {
    // Cache site info for 1 hour
    const data = await fetchApi(`/${THEME_SLUG}/v1/site-info`, {
      revalidate: 3600,
    });

    return adaptWordPressSiteInfo(data);
  } catch (error) {
    console.error("Error fetching site info:", error);
    return {
      name: "Site Name",
      description: "Site Description",
    };
  }
}

/**
 * Fetch main menu items
 * @returns Array of menu items
 */
export async function fetchMainMenu(): Promise<MenuItem[]> {
  try {
    // Cache menu for 1 hour
    const data = await fetchApi(`/${THEME_SLUG}/v1/menu/primary`, {
      revalidate: 3600,
    });

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}

/**
 * Fetch categories
 * @returns Record of category objects keyed by ID
 */
export async function fetchCategories(): Promise
  Record<number, { id: number; name: string; slug: string }>
> {
  try {
    const categories = await fetchApi("/wp/v2/categories", {
      revalidate: 3600, // Cache for 1 hour
    });

    return Array.isArray(categories)
      ? Object.fromEntries(
          categories.map((category) => [category.id, category])
        )
      : {};
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {};
  }
}