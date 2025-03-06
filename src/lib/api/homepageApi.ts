// src/lib/api/homepageApi.ts
import { fetchApi } from "./baseApi";
import {
  HomepageData,
  HeroModule,
  CTAModule,
  SellingPointsModule,
} from "@/lib/types/moduleTypes";
import { adaptWordPressHomepageData } from "@/lib/adapters/moduleAdapter";
import { fetchPostsByIds, fetchFeaturedPosts } from "./postApi";
import { fetchCategories } from "./siteApi";

/**
 * Fetch complete homepage data from the v2 endpoint
 * @returns The homepage data object
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  try {
    const [homepageResponse, categories] = await Promise.all([
      fetchApi("/startpage/v2/homepage-data", {
        revalidate: 60, // Cache for 60 seconds
      }),
      fetchCategories(),
    ]);

    // Fetch featured posts or fallback to the latest 3 posts
    const featuredPosts = homepageResponse.featured_post_ids?.length
      ? await fetchPostsByIds(homepageResponse.featured_post_ids)
      : await fetchFeaturedPosts(3);

    return {
      ...adaptWordPressHomepageData(homepageResponse),
      featured_posts: featuredPosts,
      categories,
    };
  } catch (error) {
    console.error("Error in fetchHomepageData:", error);
    // Return a minimal homepage data structure
    return {
      hero: {
        title: "Error Loading Homepage",
        intro: "There was an error loading the homepage data.",
      },
    };
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
 * Fetch CTA section data for a specific page
 * @param pageId The page ID
 * @returns A CTAModule object
 */
export async function fetchCTASection(
  pageId: number
): Promise<CTAModule | null> {
  try {
    const ctaData = await fetchApi(`/steget/v1/cta/${pageId}`, {
      revalidate: 300, // Cache for 5 minutes
    });

    return {
      type: "cta",
      id: ctaData.id || 0,
      title: ctaData.title || "",
      description: ctaData.description || "",
      buttonText: ctaData.button_text || "",
      buttonUrl: ctaData.button_url || "",
      backgroundColor: ctaData.background_color || "",
    };
  } catch (error) {
    console.error(`Error fetching CTA section for page ${pageId}:`, error);
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
