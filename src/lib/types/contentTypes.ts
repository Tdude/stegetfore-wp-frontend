// src/lib/types/contentTypes.ts
import { Module } from "./moduleTypes";
import type { BaseContent, AuthorData, PageParams } from './coreTypes';

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
 * Used for modules that display posts
 */
export interface LocalPost {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  date?: string;
  link?: string; // WP permalink
  featured_image?: string;
  featured_image_url?: string;
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
  modules?: Module[];
  // Hero data for homepage and other pages that use hero sections
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
}

export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
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
  // Add modules array for modular content
  modules?: Module[];
}

/**
 * Application Post type that extends BaseContent
 * More streamlined than the WordPress response format
 */
export interface AppPost extends BaseContent {
  featured_image_url?: string;
  categories: string[];
  tags: string[];
  author_data?: AuthorData;
  link?: string;
  meta?: Record<string, unknown>;
}
