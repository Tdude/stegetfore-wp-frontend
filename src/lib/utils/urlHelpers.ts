// src/lib/utils/urlHelpers.ts
import { Post, LocalPost } from '@/lib/types/contentTypes';

/**
 * Generates a URL for a post based on the post data
 * Handles different post formats from WordPress and local data
 * 
 * @param post The post object (can be from WordPress API or local data)
 * @returns The URL to the post
 */
export function getPostUrl(post: Post | LocalPost | any): string {
  // If the post has a link property, use that (WordPress API format)
  if (post.link && typeof post.link === 'string') {
    // If it's a full URL, try to make it relative
    if (post.link.startsWith('http')) {
      try {
        const url = new URL(post.link);
        return url.pathname;
      } catch (e) {
        // If URL parsing fails, just return the link
        return post.link;
      }
    }
    return post.link;
  }
  
  // If post has a slug, use that to build the URL
  if (post.slug && typeof post.slug === 'string') {
    return `/posts/${post.slug}`;
  }
  
  // If post has an ID but no slug, use the ID
  if (post.id) {
    return `/posts/${post.id}`;
  }
  
  // Fallback
  return '#';
}
