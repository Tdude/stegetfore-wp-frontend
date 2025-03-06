// src/lib/types/contentTypes.ts
import { Module } from "./moduleTypes";

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
  modules?: Module[]; // Add modules to base Page
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
  modules?: Module[]; // Explicitly typed as Module[]
}

/**
 * Parameters for page URLs
 */
export interface PageParams {
  params: {
    slug: string;
  };
}
