// src/lib/types/contentTypes.ts

/**
 * Base interface for content items (posts, pages, etc.)
 */
export interface BaseContent {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  template?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        width: number;
        height: number;
        sizes?: Record<
          string,
          {
            source_url: string;
            width: number;
            height: number;
          }
        >;
      };
    }>;
  };
  featured_image_url?: string | null;
  date?: string;
  modified?: string;
}

/**
 * Post content type
 */
export interface Post extends BaseContent {
  categories: number[];
  tags?: number[];
  author?: number;
  comment_status?: string;
  author_name?: string;
  author_avatar?: string;
}

/**
 * Page content type
 */
export interface Page extends BaseContent {
  parent?: number;
  menu_order?: number;
  comment_status?: string;
  chartData?: {
    segments: number[];
  } | null;
}

/**
 * Enhanced local version of Page with more strict typing
 * Includes modules array for modular pages
 */
export interface LocalPage extends BaseContent {
  chartData?: {
    segments: number[];
  } | null;
  evaluationId?: string;
  type?: string;
  modules?: any[]; // Will be replaced with Module[] from moduleTypes when imported
}

/**
 * Parameters for page URLs
 */
export interface PageParams {
  params: {
    slug: string;
  };
}

/**
 * Site information
 */
export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
  logo_url?: string;
  favicon_url?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

/**
 * Menu item
 */
export interface MenuItem {
  ID: number;
  id?: number; // Added for compatibility
  title: string;
  url: string;
  slug: string;
  target: string;
  classes?: string[];
  description?: string;
  attr_title?: string;
  xfn?: string;
  children?: MenuItem[];
}

/**
 * Category
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
}

/**
 * Tag
 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

/**
 * Media item
 */
export interface Media {
  id: number;
  source_url: string;
  alt_text?: string;
  title?: {
    rendered: string;
  };
  caption?: {
    rendered: string;
  };
  description?: {
    rendered: string;
  };
  media_type?: string;
  mime_type?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      {
        source_url: string;
        width: number;
        height: number;
      }
    >;
  };
}

/**
 * Image container types for the OptimizedImage component
 */
export type ImageContainer =
  | "hero"
  | "featured"
  | "card"
  | "gallery"
  | "default";

/**
 * Additional props for components that use featured images
 */
export interface WithFeaturedImageProps {
  featuredImageUrl?: string;
  featuredImageAlt?: string;
}
