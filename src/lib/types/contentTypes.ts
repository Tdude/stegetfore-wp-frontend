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
  content_display_settings?: {
    show_content_with_modules: boolean;
    content_position: 'before' | 'after';
  };
  show_content_with_modules?: boolean; // Legacy field, kept for backward compatibility
}

/**
 * Category type
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  count?: number;
  description?: string;
  parent?: number;
}

/**
 * Post content type
 */
export interface Post extends BaseContent {
  featured_image?: {
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
  } | string | null;
  link?: string;
  categories?: number[] | Category[] | string[];
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
  featured_media?: number;
  chartData?: {
    segments: number[];
  } | null;
  segments?: number[];
  evaluationId?: string;
  studentId?: string | number;
  meta?: {
    student_id?: string | number;
    hero?: {
      title?: string;
      intro?: string;
      image?: string | string[];
      buttons?: Array<{
        text: string;
        url: string;
        style: "primary" | "secondary" | "outline";
      }>;
    };
    [key: string]: unknown;
  };
  student_id?: string | number;
  type?: string;
}

/**
 * Enhanced local version of Page with more strict typing
 * Includes modules array for modular pages
 */
export interface LocalPage extends BaseContent {
  // We're extending BaseContent, which already has:
  // id, slug, title, content, excerpt, template, _embedded, featured_image_url, show_content_with_modules
  
  // Additional properties specific to LocalPage
  type?: string;
  
  // Override modules to be required (not optional like in BaseContent)
  modules: Module[];
  
  // Hero content for the page
  hero?: {
    title?: string;
    intro?: string;
    image?: string | string[];
    buttons?: Array<{
      text: string;
      url: string;
      style: "primary" | "secondary" | "outline";
    }>;
  };
  
  // Meta information for the page
  meta?: {
    content_position?: 'before' | 'after';
    [key: string]: unknown;
  };
}

/**
 * Parameters for page URLs
 * Aligned with Next.js App Router expectations
 */
export interface PageParams {
  params: {
    slug: string;
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
 * Homepage Data
 */
export interface HomepageData {
  id?: number;
  slug?: string;
  title?: string | { rendered: string };
  content?: { rendered: string } | string;
  excerpt?: { rendered: string } | string;
  hero?: {
    title?: string;
    content?: string;
    image?: string | string[];
    intro?: string;
    cta?: {
      text: string;
      url: string;
    };
    buttons?: Array<{
      text: string;
      url: string;
      style: "primary" | "secondary" | "outline";
    }>;
  };
  modules?: Module[];
  featured_posts_title?: string;
  selling_points?: unknown[];
  selling_points_title?: string;
  stats?: unknown[];
  stats_title?: string;
  stats_subtitle?: string;
  featured_posts?: unknown[];
  categories?: Record<number, { id: number; name: string; slug: string }>;
  date?: string;
  modified?: string;
  featured_image_url?: string | null;
  template?: string;
}

/**
 * Complete homepage data
 */
export interface HomepageDataFull extends BaseContent {
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
  [key: string]: unknown;
}
