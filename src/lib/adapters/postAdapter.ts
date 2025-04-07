// src/lib/adapters/postAdapter.ts
import { Post } from "@/lib/types/contentTypes";
import { WordPressPost } from "@/lib/types/wordpressTypes";
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
    featured_image: wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    link: wpPost.link || "",
    categories: wpPost.categories || [],
    tags: wpPost.tags || [],
    date: wpPost.date,
    modified: wpPost.modified,
    author: wpPost.author,
    author_name: wpPost._embedded?.["author"]?.[0]?.name,
    author_avatar: wpPost._embedded?.["author"]?.[0]?.avatar_urls?.["96"],
    _embedded: wpPost._embedded,
  };
}

/**
 * Adapts multiple WordPress posts to the application Post format
 * @param wpPosts Array of WordPress post data
 * @returns Array of Post objects formatted for the application
 */
export function adaptWordPressPosts(wpPosts: WordPressPost[]): Post[] {
  if (!Array.isArray(wpPosts)) return [];

  return wpPosts
    .map((post): Post | null => {
      try {
        return adaptWordPressPost(post);
      } catch (error) {
        console.error("Error adapting post:", error);
        return null;
      }
    })
    .filter((post): post is Post => post !== null);
}

/**
 * Enhances post objects with optimal image sizes and additional data
 * @param posts Array of post objects
 * @returns Enhanced post objects
 */
export function enhancePosts(posts: Post[]): Post[] {
  return posts.map((post) => {
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

    return {
      ...post,
      featured_image_url: featuredMedia
        ? getOptimalImageSize(featuredMedia, "large")
        : post.featured_image_url,
    };
  });
}
