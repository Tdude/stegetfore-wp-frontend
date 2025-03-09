// src/lib/adapters/postAdapter.ts
import { Post } from "@/lib/types";
import { getOptimalImageSize } from "@/lib/imageUtils";

/**
 * Adapts a WordPress post to the application Post format
 * @param wpPost WordPress post data
 * @returns Post object formatted for the application
 */
export function adaptWordPressPost(wpPost: any): Post | null {
  if (!wpPost) return null;

  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title: {
      rendered: wpPost.title?.rendered || "",
    },
    excerpt: {
      rendered: wpPost.excerpt?.rendered || "",
    },
    content: {
      rendered: wpPost.content?.rendered || "",
    },
    featured_image_url:
      wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      wpPost.featured_image_url ||
      null,
    categories: wpPost.categories || [],
    tags: wpPost.tags || [],
    date: wpPost.date,
    modified: wpPost.modified,
    author: wpPost.author,
    // Get author name and avatar from embedded data if available
    author_name: wpPost._embedded?.["author"]?.[0]?.name,
    author_avatar: wpPost._embedded?.["author"]?.[0]?.avatar_urls?.["96"],
  };
}

/**
 * Adapts multiple WordPress posts to the application Post format
 * @param wpPosts Array of WordPress post data
 * @returns Array of Post objects formatted for the application
 */
export function adaptWordPressPosts(wpPosts: any[]): (Post | null)[] {
  if (!Array.isArray(wpPosts)) return [];

  return wpPosts
    .map((post) => adaptWordPressPost(post))
    .filter((post): post is Post => post !== null); // Remove null values
}

/**
 * Enhances post objects with optimal image sizes and additional data
 * @param posts Array of post objects
 * @returns Enhanced post objects
 */
export function enhancePosts(posts: Post[]): Post[] {
  return posts.map((post) => {
    // If the post has embedded media, get the optimal image size
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

    return {
      ...post,
      featured_image_url: featuredMedia
        ? getOptimalImageSize(featuredMedia, "large")
        : post.featured_image_url,
    };
  });
}
