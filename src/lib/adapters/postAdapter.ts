// src/lib/adapters/postAdapter.ts
import { Post } from "@/lib/types/contentTypes";
import { getOptimalImageSize } from "@/lib/imageUtils";

/**
 * Adapts a WordPress post to the application Post format
 * @param wpPost WordPress post data
 * @returns Post object formatted for the application
 */
export function adaptWordPressPost(wpPost: unknown): Post {
  // Extract featured image from _embedded if available
  const featuredImage = wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

  return {
    id: wpPost.id,
    slug: wpPost.slug || "",
    title: {
      rendered: wpPost.title?.rendered || "",
    },
    content: {
      rendered: wpPost.content?.rendered || "",
    },
    excerpt: {
      rendered: wpPost.excerpt?.rendered || "",
    },
    featured_image: featuredImage,
    link: wpPost.link || "",
    categories: wpPost.categories || [],
    tags: wpPost.tags || [],
    template: wpPost.template || "default",
    featured_image_url: featuredImage,
    date: wpPost.date,
    modified: wpPost.modified,
    author: wpPost.author || 0,
    author_name: wpPost._embedded?.["author"]?.[0]?.name || "",
    author_avatar: wpPost._embedded?.["author"]?.[0]?.avatar_urls?.["96"] || "",
  };
}

/**
 * Adapts multiple WordPress posts to the application Post format
 * @param wpPosts Array of WordPress post data
 * @returns Array of Post objects formatted for the application
 */
export function adaptWordPressPosts(wpPosts: unknown[]): Post[] {
  if (!Array.isArray(wpPosts)) return [];

  return wpPosts.map((post) => adaptWordPressPost(post));
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
