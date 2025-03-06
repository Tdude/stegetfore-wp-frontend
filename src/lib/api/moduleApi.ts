// src/lib/api/moduleApi.ts
import { fetchApi } from "./baseApi";
import { Module } from "@/lib/types";
import { adaptWordPressModule } from "@/lib/adapters/moduleAdapter";

/**
 * Fetch modules with optional filtering
 * @param params Optional parameters for filtering
 * @returns An array of Module objects
 */
export async function fetchModules(
  params: {
    page?: number;
    pageId?: number;
    template?: string;
    category?: string;
    perPage?: number;
  } = {}
): Promise<Module[]> {
  try {
    const { pageId, template, category, page = 1, perPage = 20 } = params;

    // Build query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (template) queryParams.append("template", template);
    if (category) queryParams.append("category", category);

    // Determine the endpoint based on whether we're fetching for a specific page
    const endpoint = pageId
      ? `/steget/v1/page/${pageId}/modules?${queryParams.toString()}`
      : `/steget/v1/modules?${queryParams.toString()}`;

    // Cache modules for 10 minutes
    const modules = await fetchApi(endpoint, {
      revalidate: 600,
    });

    return Array.isArray(modules)
      ? modules.map((module: any) => adaptWordPressModule(module))
      : [];
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
}

/**
 * Fetch a specific module by ID
 * @param id The module ID
 * @returns A Module object or null if not found
 */
export async function fetchModule(id: number): Promise<Module | null> {
  try {
    const module = await fetchApi(`/steget/v1/modules/${id}`, {
      revalidate: 600, // Cache for 10 minutes
    });

    return module ? adaptWordPressModule(module) : null;
  } catch (error) {
    console.error(`Error fetching module with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch modules by template type
 * @param template The template type
 * @returns An array of Module objects
 */
export async function fetchModulesByTemplate(
  template: string
): Promise<Module[]> {
  return fetchModules({ template });
}

/**
 * Fetch modules by category
 * @param category The category slug
 * @returns An array of Module objects
 */
export async function fetchModulesByCategory(
  category: string
): Promise<Module[]> {
  return fetchModules({ category });
}

/**
 * Fetch modules for a specific page
 * @param pageId The page ID
 * @param template Optional template filter
 * @returns An array of Module objects
 */
export async function fetchPageModules(
  pageId: number,
  template?: string
): Promise<Module[]> {
  return fetchModules({ pageId, template });
}
