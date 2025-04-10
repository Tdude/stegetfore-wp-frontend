// src/services/moduleService.ts
import { Module } from "@/lib/types/moduleTypes";
import {
  fetchModule,
  fetchModules,
  fetchModulesByTemplate,
  fetchModulesByCategory,
} from "@/lib/api";
import { fetchPostsByIds, fetchFeaturedPosts } from "@/lib/api";
import { fetchCategories } from "@/lib/api";

/**
 * Enhances modules with additional data like posts and categories
 * @param modules Array of modules to enhance
 * @returns Enhanced modules
 */
export async function enhanceModules(modules: Module[]): Promise<Module[]> {
  if (!modules?.length) return [];

  // Process modules that need enhancement
  const enhancedModules = await Promise.all(
    modules.map(async (module) => {
      switch (module.type) {
        case "featured-posts":
          return await enhanceFeaturedPostsModule(module);
        default:
          return module;
      }
    })
  );

  return enhancedModules;
}

/**
 * Enhances a featured posts module with actual post data
 * @param module The featured posts module to enhance
 * @returns Enhanced module with posts data
 */
async function enhanceFeaturedPostsModule(module: any): Promise<Module> {
  try {
    // If the module already has posts with content, return as is
    if (module.posts?.length && module.posts[0].content) {
      return module;
    }

    // Get post IDs from the module or use a count
    const postIds = module.post_ids || [];
    const count = module.count || 3;

    // Fetch posts based on IDs or featured status
    const posts = postIds.length
      ? await fetchPostsByIds(postIds)
      : await fetchFeaturedPosts(count);

    // Get categories if show_categories is true
    let categories = {};
    if (module.show_categories) {
      categories = await fetchCategories();
    }

    return {
      ...module,
      posts,
      categories,
    };
  } catch (error) {
    console.error("Error enhancing featured posts module:", error);
    return module;
  }
}

/**
 * Fetches and prepares modules for a page
 * @param pageId The ID of the page to fetch modules for
 * @param templateFilter Optional template filter
 * @returns Enhanced modules ready for display
 */
export async function getPageModules(
  pageId: number,
  templateFilter?: string
): Promise<Module[]> {
  try {
    // Fetch modules for the page
    const endpoint = templateFilter
      ? `/steget/v1/page/${pageId}/modules?template=${templateFilter}`
      : `/steget/v1/page/${pageId}/modules`;

    const modules = await fetchModules({ page: pageId });

    // Enhance modules with additional data
    return await enhanceModules(modules);
  } catch (error) {
    console.error(`Error fetching modules for page ${pageId}:`, error);
    return [];
  }
}

/**
 * Groups modules by section for layout purposes
 * @param modules Array of modules to group
 * @returns Modules grouped by section
 */
export function groupModulesBySection(
  modules: Module[]
): Record<string, Module[]> {
  if (!modules?.length) return {};

  // Default sections
  const sections: Record<string, Module[]> = {
    header: [],
    main: [],
    sidebar: [],
    footer: [],
    other: [],
  };

  // Group modules by their section property
  modules.forEach((module) => {
    const section = module.settings?.section || "main";

    if (sections[section]) {
      sections[section].push(module);
    } else {
      sections.other.push(module);
    }
  });

  // Sort modules by order property within each section
  Object.keys(sections).forEach((section) => {
    sections[section].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  });

  return sections;
}

/**
 * Gets the first module of a specific type from a modules array
 * @param modules Array of modules to search
 * @param type The module type to find
 * @returns The first module of the specified type, or null if not found
 */
export function getModuleByType(
  modules: Module[],
  type: string
): Module | null {
  if (!modules?.length) return null;

  return modules.find((module) => module.type === type) || null;
}

/**
 * Gets all modules of a specific type from a modules array
 * @param modules Array of modules to search
 * @param type The module type to find
 * @returns Array of modules of the specified type
 */
export function getModulesByType(modules: Module[], type: string): Module[] {
  if (!modules?.length) return [];

  return modules.filter((module) => module.type === type);
}
