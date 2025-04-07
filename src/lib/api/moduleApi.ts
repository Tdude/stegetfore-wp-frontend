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
    // Try both taxonomy fields for category
    if (category) {
      // Try the standard "category" parameter
      queryParams.append("category", category);

      // If your endpoint supports it, also add a module_category parameter
      queryParams.append("module_category", category);
    }

    // Determine the endpoint based on whether we're fetching for a specific page
    const endpoint = pageId
      ? `/steget/v1/page/${pageId}/modules?${queryParams.toString()}`
      : `/steget/v1/modules?${queryParams.toString()}`;

    // Cache modules for 10 minutes
    const modules = await fetchApi(endpoint, {
      revalidate: 600,
    });

    // Ensure we have an array of modules and they're properly adapted
    if (!Array.isArray(modules)) {
      console.warn(`fetchModules: expected array but got ${typeof modules}`);
      return [];
    }

    // Make sure to return a properly typed array
    return modules
      .map((module: any) => adaptWordPressModule(module))
      .filter(Boolean) as Module[];
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
    const moduleData = await fetchApi(`/steget/v1/modules/${id}`, {
      revalidate: 600, // Cache for 10 minutes
    });

    return moduleData ? adaptWordPressModule(moduleData) : null;
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
 * @param category The category slug or name
 * @returns An array of Module objects
 */
// src/lib/api/moduleApi.ts - update fetchModulesByCategory function

// src/lib/api/moduleApi.ts
export async function fetchModulesByCategory(
  category: string
): Promise<Module[]> {
  try {
    // Normalize the input category - convert to slug-like format
    const normalizedCategory = category
      .toLowerCase()
      .replace(/å/g, "a")
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/\s+/g, "-");

    console.log(
      `Looking for modules with normalized category: ${normalizedCategory}`
    );

    // Make the API request
    const endpoint = `/steget/v1/modules?category=${encodeURIComponent(
      normalizedCategory
    )}`;
    console.log(`Fetching from: ${endpoint}`);

    const response = await fetchApi(endpoint, {
      revalidate: 600,
    });

    // Check the structure of the response
    console.log("API Response structure:", {
      type: typeof response,
      isArray: Array.isArray(response),
      hasModulesProperty:
        response && typeof response === "object" && "modules" in response,
    });

    // Handle different response formats
    let modulesData;
    if (Array.isArray(response)) {
      modulesData = response;
    } else if (
      response &&
      typeof response === "object" &&
      "modules" in response
    ) {
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
