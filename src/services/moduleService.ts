// src/services/moduleService.ts
import { Module, FeaturedPostsModule } from "@/lib/types/moduleTypes";
import { fetchModules } from "@/lib/api";
import { fetchFeaturedPosts } from "@/lib/api";
import { fetchCategories } from "@/lib/api";

// Define proper interface for category data based on how it's used in the codebase
interface CategoryData {
  id: number;
  name: string;
  slug: string;
  [key: string]: unknown; // Add index signature for additional properties
}

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
          return await enhanceFeaturedPostsModule(module as FeaturedPostsModule);
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
async function enhanceFeaturedPostsModule(module: FeaturedPostsModule): Promise<FeaturedPostsModule> {
  if (!module.categories || module.categories.length === 0) {
    // No categories specified, use default logic
    return module;
  }

  try {
    // Process category IDs as needed for the API
    const categoryIds = Array.isArray(module.categories) 
      ? module.categories.join(',') 
      : module.categories.toString();

    // Fetch posts for the specified categories
    const featuredPosts = await fetchFeaturedPosts({
      categories: categoryIds,
      per_page: module.post_count || 3,
    });

    // Fetch categories data once and build an array
    const categories = await fetchCategories();
    
    // Convert the categories from Record to array format with proper typing
    const categoriesData: CategoryData[] = Array.isArray(categories) 
      ? categories.map(category => ({
          ...category // Include all properties from original
        }))
      : Object.values(categories).map(category => ({
          ...category // Include all properties from original
        }));

    // Return enhanced module with posts and categories
    return {
      ...module,
      posts: featuredPosts,
      categoriesData: categoriesData
    };
  } catch (error) {
    console.error('Error enhancing featured posts module:', error);
    return {
      ...module,
      posts: [],
      categoriesData: []
    };
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
    const modules = await fetchModules({ page: pageId });

    // Filter by template if requested
    const filteredModules = templateFilter
      ? modules.filter(module => {
          // If template is defined on the module, filter by it
          if (module.template) {
            return module.template === templateFilter;
          }
          return true; // Include modules without a template
        })
      : modules;

    // Return enhanced modules with any additional data needed
    return await enhanceModules(filteredModules);
  } catch (error) {
    console.error(`Error getting modules for page ${pageId}:`, error);
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

  // Define valid section types
  type SectionKey = 'header' | 'main' | 'sidebar' | 'footer' | 'other';

  // Default sections
  const sections: Record<SectionKey, Module[]> = {
    header: [],
    main: [],
    sidebar: [],
    footer: [],
    other: [],
  };

  // Group modules by their section property
  modules.forEach((module) => {
    const sectionName = module.settings?.section as string || "main";
    
    // Type-safe check if section exists
    const section = sectionName as SectionKey;
    if (Object.prototype.hasOwnProperty.call(sections, section)) {
      sections[section].push(module);
    } else {
      sections.other.push(module);
    }
  });

  // Sort modules by order property within each section
  Object.keys(sections).forEach((section) => {
    sections[section as SectionKey].sort((a, b) => {
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
