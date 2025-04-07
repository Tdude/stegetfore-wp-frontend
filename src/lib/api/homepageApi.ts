// src/lib/api/homepageApi.ts
import { fetchApi } from "./baseApi";
import { fetchPostsByIds, fetchFeaturedPosts } from "./postApi";
import { fetchCategories } from "./siteApi";
import { Post } from "@/lib/types/contentTypes";

import type {
  CTAModule,
  HeroModule,
  Module,
  SellingPointsModule,
  TestimonialsModule,
  VideoModule,
  ModuleHomepageData,
} from "@/lib/types/moduleTypes";

import {
  adaptWordPressHomepageData,
  adaptWordPressModules,
} from "@/lib/adapters/moduleAdapter";
import { adaptWordPressPost } from "@/lib/adapters/postAdapter";

interface WordPressHomepageResponse {
  featured_posts?: any[];
  [key: string]: any;
}

/**
 * Fetch complete homepage data including modules
 * @returns The complete homepage data
 */
export async function fetchHomepageData(): Promise<ModuleHomepageData> {
  try {
    const rawData = await fetchApi<WordPressHomepageResponse>("/steget/v1/homepage", {
      revalidate: 300,
    });

    const categories = rawData.featured_posts?.length
      ? await fetchCategories()
      : {};

    const homepageData = adaptWordPressHomepageData(rawData);
    homepageData.categories = categories;

    return {
      ...homepageData,
      title: typeof homepageData.title === "string" ? homepageData.title : "Default Title",
      modules: Array.isArray(homepageData.modules) ? homepageData.modules : [],
      featured_posts: rawData.featured_posts
        ? rawData.featured_posts
            .map((post: any) => adaptWordPressPost(post))
            .filter((post): post is Post => post !== null) as any[]
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      title: "Homepage",
      modules: [],
      categories: {},
    };
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

    const ctaData = (await fetchApi(endpoint, {
      revalidate: 300, // Cache for 5 minutes
    })) as {
      id?: number;
      title?: string;
      description?: string;
      content?: string;
      button_text?: string;
      button_url?: string;
      background_color?: string;
      text_color?: string;
      alignment?: string;
      image?: string;
    };

    return {
      type: "cta",
      id: ctaData.id || 0,
      title: ctaData.title || "",
      description: ctaData.description || ctaData.content || "",
      buttonText: ctaData.button_text || "",
      buttonUrl: ctaData.button_url || "",
      backgroundColor: ctaData.background_color || "",
      textColor: ctaData.text_color || "",
      alignment: ["center", "left", "right"].includes(ctaData.alignment || "")
        ? (ctaData.alignment as "center" | "left" | "right")
        : "center",
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
    const modules = (result as { modules?: any[] }).modules || result;

    // Ensure modules is an array before accessing its properties
    if (Array.isArray(modules) && !modules.length && category) {
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

      const allModules = (allModulesResult as { modules?: any[] }).modules || allModulesResult;

      // Filter modules that include the category in their categories array
      const filteredModules = (allModules as { categories: any[] }[]).filter(
        (module) =>
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
    const heroData = (await fetchApi(`/steget/v1/hero/${pageId}`, {
      revalidate: 300, // Cache for 5 minutes
    })) as {
      id?: number;
      title?: string;
      intro?: string;
      image?: string;
      buttons?: any[];
    };

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
    const sellingPointsData = (await fetchApi(
      `/steget/v1/selling-points/${pageId}`,
      {
        revalidate: 300, // Cache seconds
      }
    )) as {
      id?: number;
      title?: string;
      points?: any[];
    };

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
    const testimonials = (await fetchApi("/steget/v1/testimonials", {
      revalidate: 3600, // Cache 1 hour
    })) as { title?: string; items?: any[] };

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
export interface FeaturedPostsResponse {
  title?: string;
  post_ids?: number[];
  count?: number;
}
export async function fetchFeaturedPostsModule() {
  try {
    const featuredPostsData = await fetchApi<FeaturedPostsResponse>("/steget/v1/featured-posts", {
      revalidate: 3600, // Cache for 1 hour
    });

    // Fetch the actual posts
    const posts = featuredPostsData.post_ids?.length
      ? await fetchPostsByIds(featuredPostsData.post_ids)
      : await fetchFeaturedPosts(featuredPostsData.count || 3);

    return {
      type: "featured-posts" as const,
      id: 0,
      title: featuredPostsData.title || "Featured Posts",
      posts,
    };
  } catch (error) {
    console.error("Error fetching featured posts module:", error);
    return {
      type: "featured-posts" as const,
      id: 0,
      title: "Featured Posts",
      posts: [],
    };
  }
}
