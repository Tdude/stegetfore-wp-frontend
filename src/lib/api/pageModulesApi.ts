// src/lib/api/pageModulesApi.ts - API route handlers for fetching page modules

import { fetchApi } from './baseApi';
import { Module } from '@/lib/types/moduleTypes';
import { adaptWordPressModule } from '@/lib/adapters/moduleAdapter';

// Define a type for the API response
interface PageModulesResponse {
  modules?: any[];
  [key: string]: any;
}

/**
 * Fetch modules for a specific page by ID
 * @param pageId The ID of the page to fetch modules for
 * @returns Array of modules associated with the page
 */
export async function fetchPageModulesById(pageId: number): Promise<Module[]> {
  try {
    const response = await fetchApi<PageModulesResponse>(`/wp/v2/pages/${pageId}`, {
      revalidate: 300 // Cache for 5 minutes
    });

    if (response && response.modules && Array.isArray(response.modules)) {
      return response.modules
        .map((module: any) => adaptWordPressModule(module))
        .filter((module): module is Module => module !== null);
    }

    return [];
  } catch (error) {
    console.error(`Error fetching modules for page ${pageId}:`, error);
    return [];
  }
}

/**
 * Fetch modules for the homepage (page ID: 2)
 * @returns Array of modules associated with the homepage
 */
export async function fetchHomepageModules(): Promise<Module[]> {
  return fetchPageModulesById(2); // Homepage ID is 2
}

/**
 * Fetch modules by category
 * @param category The category slug (e.g., 'homepage')
 * @returns Array of modules in the specified category
 */
export async function fetchModulesByCategory(category: string): Promise<Module[]> {
  try {
    // Use the WordPress REST API to fetch modules by category
    const response = await fetchApi(`/steget/v1/modules?category=${encodeURIComponent(category)}`, {
      revalidate: 300 // Cache for 5 minutes
    });

    let modulesData;
    if (Array.isArray(response)) {
      modulesData = response;
    } else if (response && typeof response === "object" && "modules" in response) {
      modulesData = response.modules;
    } else {
      console.warn("Unexpected API response format:", response);
      modulesData = [];
    }

    // Ensure it's an array and adapt each module
    if (!Array.isArray(modulesData)) {
      console.warn("Modules data is not an array:", modulesData);
      modulesData = [];
    }

    return modulesData
      .map((module: any) => adaptWordPressModule(module))
      .filter(Boolean) as Module[];
  } catch (error) {
    console.error(`Error fetching modules for category ${category}:`, error);
    return [];
  }
}
