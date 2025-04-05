// src/lib/api/pageModulesApi.ts - API route handlers for fetching page modules

import { fetchApi } from './baseApi';
import { Module } from '@/lib/types';
import { adaptWordPressModule } from '@/lib/adapters/moduleAdapter';

/**
 * Fetch modules for a specific page by ID
 * @param pageId The ID of the page to fetch modules for
 * @returns Array of modules associated with the page
 */
export async function fetchPageModulesById(pageId: number): Promise<Module[]> {
  try {
    // Use the WordPress REST API to fetch the page with its modules
    const response = await fetchApi(`/wp/v2/pages/${pageId}`, {
      revalidate: 300 // Cache for 5 minutes
    });

    // Check if the page has modules
    if (response && response.modules && Array.isArray(response.modules)) {
      // Return the modules array
      return response.modules.map((module: any) => adaptWordPressModule(module));
    }

    // If no modules found, return empty array
    return [];
  } catch (error) {
    console.error(`Error fetching modules for page ${pageId}:`, error);
    // Return empty array in case of error to prevent UI breakage
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

    // Handle different response formats
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
