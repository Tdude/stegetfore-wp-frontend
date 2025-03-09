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
  comment_status?: "open" | "closed";
  author_name?: string;
  author_avatar?: string;
  meta?: Record<string, unknown>;
}

/**
 * Page content type
 */
export interface Page extends BaseContent {
  parent?: number;
  menu_order?: number;
  comment_status?: "open" | "closed";
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
  id: number;
  slug: string;
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
    slug: string | Promise<string>;
  };
}

export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
  logo_url?: string;
  favicon_url?: string;
  social_links?: Record<string, string>;
}

export interface MenuItem {
  ID: number;
  id?: number; // For compatibility
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
