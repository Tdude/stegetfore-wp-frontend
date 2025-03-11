// src/services/dataService.ts
import Page, { HomepageData, Module, Post } from "@/lib/types";
import {
  fetchHomepageData,
  fetchFeaturedPosts,
  fetchCategories,
} from "@/lib/api";
import { adaptWordPressHomepageData } from "@/lib/adapters";

/**
 * Fetches complete homepage data with all necessary components
 * @returns Enhanced homepage data
 */
export async function getEnhancedHomepageData(): Promise<HomepageData> {
  try {
    // Fetch basic homepage data
    const homepageData: HomepageData = await fetchHomepageData();

    // If homepage data is complete, return it
    if (homepageData.featured_posts?.length && homepageData.categories) {
      return homepageData;
    }

    // Otherwise, fetch missing data
    const [featuredPosts, categories] = await Promise.all([
      !homepageData.featured_posts?.length
        ? fetchFeaturedPosts(3)
        : Promise.resolve(homepageData.featured_posts),
      !homepageData.categories
        ? fetchCategories()
        : Promise.resolve(homepageData.categories),
    ]);

    // Combine data
    return {
      ...homepageData,
      featured_posts: featuredPosts,
      categories,
    };
  } catch (error) {
    console.error("Error getting enhanced homepage data:", error);

    // Return a minimal fallback
    return {
      hero: {
        title: "Welcome to Our Site",
        intro: "Explore our content below",
        image: "/images/hero-fallback.jpg",
      },
      featured_posts: [],
      featured_posts_title: "Featured Content",
    };
  }
}

/**
 * Processes raw homepage data from the API
 * @param rawData Raw homepage data (could be string or object)
 * @returns Processed homepage data
 */
export function processHomepageData(rawData: any): HomepageData {
  try {
    // If data is a string, try to parse it
    if (typeof rawData === "string") {
      try {
        const parsed = JSON.parse(rawData);
        return adaptWordPressHomepageData(parsed);
      } catch (e) {
        console.error("Failed to parse homepage data:", e);
        return {};
      }
    }

    // If already an object, adapt it
    return adaptWordPressHomepageData(rawData);
  } catch (error) {
    console.error("Error processing homepage data:", error);
    return {};
  }
}

/**
 * Transforms post objects for display in various contexts
 * @param posts Array of post objects
 * @param context Display context
 * @returns Transformed posts
 */
export function transformPostsForDisplay(
  posts: Post[],
  context: "card" | "list" | "featured" = "card"
): Post[] {
  if (!posts?.length) return [];

  return posts.map((post) => {
    // Base transformations for all contexts
    const transformed = {
      ...post,
      title: {
        rendered: post.title.rendered,
      },
    };

    // Context-specific transformations
    switch (context) {
      case "card":
        // For cards, truncate the excerpt
        if (transformed.excerpt?.rendered) {
          transformed.excerpt.rendered = truncateHtml(
            transformed.excerpt.rendered,
            150
          );
        }
        break;

      case "list":
        // For lists, create a shorter excerpt
        if (transformed.content?.rendered) {
          transformed.excerpt = {
            rendered: truncateHtml(transformed.content.rendered, 100),
          };
        }
        break;

      case "featured":
        // For featured, ensure we have impressive excerpts
        if (
          transformed.content?.rendered &&
          (!transformed.excerpt?.rendered ||
            transformed.excerpt.rendered.length < 50)
        ) {
          transformed.excerpt = {
            rendered: truncateHtml(transformed.content.rendered, 200),
          };
        }
        break;
    }

    return transformed;
  });
}

/**
 * Truncates HTML content to a maximum length while preserving HTML structure
 * @param html HTML content
 * @param maxLength Maximum length
 * @returns Truncated HTML
 */
export function truncateHtml(html: string, maxLength: number): string {
  if (!html || html.length <= maxLength) return html;

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Get the text content
  const textContent = tempDiv.textContent || "";

  if (textContent.length <= maxLength) {
    return html;
  }

  // Find a good breaking point
  let truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    truncated = truncated.substring(0, lastSpace);
  }

  return truncated + "...";
}

/**
 * Groups array items into chunks of specified size
 * @param array Array to chunk
 * @param size Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (!array?.length) return [];

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}
