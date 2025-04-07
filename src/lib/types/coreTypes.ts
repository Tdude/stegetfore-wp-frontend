/**
 * Base content interface for all content types
 * This serves as the foundation for both WordPress API responses and application data
 */
export interface BaseContent {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  template?: string;
  date?: string;
  modified?: string;
  featured_media?: number;
  featured_image_url?: string | null;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        width?: number;
        height?: number;
        file?: string;
        sizes?: Record<
          string,
          {
            source_url: string;
            width?: number;
            height?: number;
          }
        >;
      };
    }>;
    author?: Array<{
      name: string;
      avatar_urls: Record<string, string>;
    }>;
  };
}

/**
 * Standard author data structure
 */
export interface AuthorData {
  name?: string;
  avatar?: string;
}

/**
 * Media embed structure for WordPress _embedded fields
 * A simplified version of the _embedded["wp:featuredmedia"] structure
 */
export interface MediaEmbed {
  source_url: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    file?: string;
    sizes?: Record<string, {
      source_url: string;
      width?: number;
      height?: number;
    }>;
  };
}

/**
 * Image container types used to determine appropriate responsive image sizes
 */
export type ImageContainer = 'default' | 'thumbnail' | 'hero' | 'gallery' | 'featured' | 'full-width' | 'card';

/**
 * Parameters for page URLs
 */
export interface PageParams {
  params: {
    slug: string | Promise<string>;
  };
}
