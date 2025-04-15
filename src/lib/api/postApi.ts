// src/lib/api/postApi.ts
import { fetchApi } from "./baseApi";
import { Post } from "@/lib/types/contentTypes";
import {
  adaptWordPressPost,
  adaptWordPressPosts,
} from "@/lib/adapters/postAdapter";
import { getOptimalImageSize } from "@/lib/imageUtils";

/**
 * Fetch posts with optional pagination and filtering
 * @param params Optional parameters for filtering and pagination
 * @returns An array of Post objects
 */
export async function fetchPosts(
  params: {
    page?: number;
    perPage?: number;
    search?: string;
    categories?: number[];
    tags?: number[];
    orderBy?: string;
    order?: "asc" | "desc";
  } = {}
): Promise<Post[]> {
  try {
    const {
      page = 1,
      perPage = 12,
      search,
      categories,
      tags,
      orderBy = "date",
      order = "desc",
    } = params;

    // Build query string from parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: orderBy,
      order: order,
      _embed: "true",
    });

    if (search) queryParams.append("search", search);
    if (categories?.length)
      queryParams.append("categories", categories.join(","));
    if (tags?.length) queryParams.append("tags", tags.join(","));

    // Cache posts list for 1 hour
    const posts = await fetchApi(`/wp/v2/posts?${queryParams.toString()}`, {
      revalidate: 3600,
    });

    // Map the response to match our Post interface
    return adaptWordPressPosts(posts.data);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

/**
 * Fetch a single post by slug
 * @param slug The post slug
 * @returns A Post object or null if not found
 */
export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const posts = await fetchApi(`/wp/v2/posts?slug=${slug}&_embed`, {
      revalidate: 1200, // Cache for 20 minutes
    });

    if (!Array.isArray(posts) || posts.length === 0) {
      return null;
    }

    const post = posts[0];
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

    return {
      ...adaptWordPressPost(post),
      // Add optimal featured image URL if available
      featured_image_url: featuredMedia
        ? getOptimalImageSize(featuredMedia, "large")
        : null,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

/**
 * Fetch posts by an array of IDs
 * @param ids Array of post IDs
 * @returns Array of Post objects
 */
export async function fetchPostsByIds(ids: number[]): Promise<Post[]> {
  try {
    if (!ids.length) return [];

    const posts = await fetchApi(
      `/wp/v2/posts?include=${ids.join(",")}&_embed`,
      {
        revalidate: 60, // Cache for 1 minute
      }
    );

    return adaptWordPressPosts(posts.data);
  } catch (error) {
    console.error("Error in fetchPostsByIds:", error);
    return [];
  }
}

/**
 * Fetch featured posts
 * @param count Number of featured posts to fetch
 * @returns Array of Post objects
 */
export async function fetchFeaturedPosts(count: number = 3): Promise<Post[]> {
  try {
    const featuredTagId = 17; // Actual "fokus" tag ID (17)
    const posts = await fetchApi(
      `/wp/v2/posts?_embed&per_page=${count}&categories=${featuredTagId}`,
      {
        revalidate: 3600, // Cache for 1 hour
      }
    );

    return adaptWordPressPosts(posts.data);
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
}

/**
 * Fetch blog settings from the WordPress API
 * @returns Blog settings including layout style
 */
export async function fetchBlogSettings() {
  try {
    const response = await fetchApi(`steget/v1/blog-settings`, {
      revalidate: 3600 // Cache for 1 hour
    });
    
    // Extract the actual data from the response
    const data = response.data || {};
    
    return {
      layoutStyle: data.layout_style || 'traditional',
      postsPerPage: data.posts_per_page || 10,
      showAuthor: data.show_author ?? true,
      showDate: data.show_date ?? true,
      showExcerpt: data.show_excerpt ?? true
    };
  } catch (error) {
    console.error('Error fetching blog settings:', error);
    // Return default settings if there's an error
    return {
      layoutStyle: 'traditional',
      postsPerPage: 10,
      showAuthor: true,
      showDate: true,
      showExcerpt: true
    };
  }
}
