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
  modules?: Module[];
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
  featured_image: string | null | undefined;
  link: string;
  categories: number[] | string[];
  tags?: number[];
  author?: number;
  comment_status?: "open" | "closed";
  author_name?: string;
  author_avatar?: string;
  meta?: Record<string, unknown>;
}

/**
 * Post interface matching the API response structure
 * Imported explicitly to moduleTypes.ts for FeaturedPosts
 */
export interface LocalPost {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  date?: string;
  link?: string; // WP permalink
  featured_image?: string;
  featured_image_url?: string; // Because of sloppy coding
  categories?: string[];
  slug?: string;
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
  evaluationId?: string;
  studentId?: string | number;
  meta?: {
    student_id?: string | number;
    [key: string]: any;
  };
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
  studentId?: string | number;
  meta?: {
    student_id?: string | number;
    [key: string]: any;
  };
  type?: string;
  modules: Module[]; // Use Module from moduleTypes.ts
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

/**
 * Complete homepage data
 */
export interface HomepageData extends BaseContent {
  featured_posts?: LocalPost[];
  categories?: Record<number, { id: number; name: string; slug: string }>;
  hero?: {
    title?: string;
    intro?: string;
    image?: string | string[];
    buttons?: Array<{
      text: string;
      url: string;
      style: "primary" | "secondary" | "outline" | "link" | "ghost" | "default";
    }>;
  };
  featured_posts_title?: string;
  selling_points?: Array<{
    id: number;
    title: string;
    content: string;
    description?: string;
    icon?: string;
  }>;
  selling_points_title?: string;
  stats?: Array<{
    id: number;
    value: string;
    label: string;
  }>;
  stats_title?: string;
  stats_subtitle?: string;
  stats_background_color?: string;
  gallery?: Array<{
    id: number;
    image: string;
    title?: string;
    description?: string;
  }>;
  gallery_title?: string;
  testimonials?: Array<{
    id: number;
    content: string;
    author_name: string;
    author_position: string;
    author_image?: string;
  }>;
  testimonials_title?: string;
  cta?: {
    title?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    background_color?: string;
  };
  modules?: Module[]; // Use Module from moduleTypes.ts
  [key: string]: any;
}
