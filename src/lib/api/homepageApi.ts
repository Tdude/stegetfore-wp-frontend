// src/lib/api/homepageApi.ts
import {
  fetchApi,
  fetchPostsByIds,
  fetchFeaturedPosts,
  fetchCategories,
} from "../api";

import {
  CTAModule,
  HeroModule,
  HomepageData,
  Module,
  SellingPointsModule,
} from "@/lib/types";
import {
  adaptWordPressHomepageData,
  adaptWordPressModules,
} from "@/lib/adapters";

/**
 * Fetch complete homepage data including modules
 * @returns The complete homepage data
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  try {
    console.log("Fetching homepage data");
    const rawData = await fetchApi("/steget/v1/homepage", {
      revalidate: 300, // Cache for 5 minutes
    });

    // Get categories for the posts if we have featured posts
    const categories = rawData.featured_posts?.length
      ? await fetchCategories()
      : {};

    // Adapt the data to our application's format
    const homepageData = adaptWordPressHomepageData(rawData);

    // Add categories to the homepage data
    homepageData.categories = categories;

    return homepageData;
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    // Return empty object in case of error
    return {};
  }
}

/**
 * Fetch CTA section data
 * @param id Optional ID for a specific CTA
 * @returns A CTAModule object
 */
export async function fetchCTASection(id?: number): Promise<CTAModule | null> {
  try {
    const endpoint = id ? `/steget/v1/cta/${id}` : "/steget/v1/cta";
    console.log(`Fetching CTA section from ${endpoint}`);

    const ctaData = await fetchApi(endpoint, {
      revalidate: 300, // Cache for 5 minutes
    });

    return {
      type: "cta",
      id: ctaData.id || 0,
      title: ctaData.title || "",
      description: ctaData.description || ctaData.content || "",
      buttonText: ctaData.button_text || "",
      buttonUrl: ctaData.button_url || "",
      backgroundColor: ctaData.background_color || "",
      textColor: ctaData.text_color || "",
      alignment: ctaData.alignment || "center",
      image: ctaData.image || "",
    };
  } catch (error) {
    console.error(`Error fetching CTA section${id ? ` ${id}` : ""}:`, error);
    return null;
  }
}

/**
 * Fetch modules for a specific page
 * @param pageId The page ID
 * @returns Array of Module objects
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

    // For category, we need to handle it differently
    if (category) {
      // Try the taxonomy parameter format - may vary depending on your API
      queryParams.append("module_category", category);
    }

    // Determine the endpoint based on whether we're fetching for a specific page
    const endpoint = pageId
      ? `/steget/v1/page/${pageId}/modules?${queryParams.toString()}`
      : `/steget/v1/modules?${queryParams.toString()}`;

    console.log("Modules endpoint:", endpoint); // Debug the actual URL

    // Fetch modules
    const result = await fetchApi(endpoint, {
      revalidate: 600,
    });

    // Handle different response formats
    const modules = result.modules || result;

    // If no modules found with the category filter, try fetching all and filtering client-side
    if (!modules.length && category) {
      console.log(
        "No modules found with category filter, trying client-side filtering"
      );

      // Fetch all modules
      const allModulesResult = await fetchApi(
        `/steget/v1/modules?per_page=${perPage}`,
        {
          revalidate: 600,
        }
      );

      const allModules = allModulesResult.modules || allModulesResult;

      // Filter modules that include the category in their categories array
      const filteredModules = allModules.filter(
        (module: { categories: any[] }) =>
          Array.isArray(module.categories) &&
          module.categories.some(
            (cat) =>
              typeof cat === "string" &&
              cat.toLowerCase() === category.toLowerCase()
          )
      );

      return adaptWordPressModules(filteredModules);
    }

    return adaptWordPressModules(Array.isArray(modules) ? modules : []);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
}

/**
 * Fetch hero section data for a specific page
 * @param pageId The page ID
 * @returns A HeroModule object
 */
export async function fetchHeroSection(
  pageId: number
): Promise<HeroModule | null> {
  try {
    const heroData = await fetchApi(`/steget/v1/hero/${pageId}`, {
      revalidate: 300, // Cache for 5 minutes
    });

    return {
      type: "hero",
      id: heroData.id || 0,
      title: heroData.title || "",
      intro: heroData.intro || "",
      image: heroData.image || "",
      buttons: heroData.buttons || [],
    };
  } catch (error) {
    console.error(`Error fetching hero section for page ${pageId}:`, error);
    return null;
  }
}

/**
 * Fetch selling points for a specific page
 * @param pageId The page ID
 * @returns A SellingPointsModule object
 */
export async function fetchSellingPoints(
  pageId: number
): Promise<SellingPointsModule | null> {
  try {
    const sellingPointsData = await fetchApi(
      `/steget/v1/selling-points/${pageId}`,
      {
        revalidate: 300, // Cache for 5 minutes
      }
    );

    return {
      type: "selling-points",
      id: sellingPointsData.id || 0,
      title: sellingPointsData.title || "",
      points: sellingPointsData.points || [],
    };
  } catch (error) {
    console.error(`Error fetching selling points for page ${pageId}:`, error);
    return null;
  }
}

/**
 * Fetch testimonials module
 * @returns The testimonials data
 */
export async function fetchTestimonialsModule() {
  try {
    const testimonials = await fetchApi("/steget/v1/testimonials", {
      revalidate: 3600, // Cache for 1 hour
    });

    return {
      type: "testimonials",
      id: 0,
      title: testimonials.title || "Testimonials",
      testimonials: testimonials.items || [],
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return {
      type: "testimonials",
      id: 0,
      title: "Testimonials",
      testimonials: [],
    };
  }
}

/**
 * Fetch featured posts module
 * @returns The featured posts module data
 */
export async function fetchFeaturedPostsModule() {
  try {
    const featuredPostsData = await fetchApi("/steget/v1/featured-posts", {
      revalidate: 3600, // Cache for 1 hour
    });

    // Fetch the actual posts
    const posts = featuredPostsData.post_ids?.length
      ? await fetchPostsByIds(featuredPostsData.post_ids)
      : await fetchFeaturedPosts(featuredPostsData.count || 3);

    return {
      type: "featured-posts",
      id: 0,
      title: featuredPostsData.title || "Featured Posts",
      posts,
    };
  } catch (error) {
    console.error("Error fetching featured posts module:", error);
    return {
      type: "featured-posts",
      id: 0,
      title: "Featured Posts",
      posts: [],
    };
  }
}
