// types/baseTypes.ts
// Contains commonly used type definitions across the application

// Import types from contentTypes where they're properly defined
import type { BaseContent, Post, Page, LocalPage } from './contentTypes';

// Re-export for backward compatibility
export type { BaseContent, Post, Page, LocalPage };

// Node.js environment type definitions
declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_WORDPRESS_URL: string;
    NEXT_PUBLIC_THEME_SLUG: string;
    NEXT_PUBLIC_USE_MODULAR_TEMPLATES: string;
    NEXT_PUBLIC_DEBUG_MODE?: string; // For controlling debug features independent of NODE_ENV
    REVALIDATION_TOKEN: string;
    HOMEPAGE_ID: string;
    NODE_ENV: "development" | "production" | "test";
  }
}

// Image container types for the OptimizedImage component
export type ImageContainer =
  | "hero"
  | "featured"
  | "card"
  | "gallery"
  | "default";

// Image-related helper functions
export interface ImageHelper {
  getImageUrl: (media: any, size?: string) => string;
  getImageAlt: (media: any, fallback?: string) => string;
  stripHtml: (html: string) => string;
}

// Additional props for components that use featured images
export interface WithFeaturedImageProps {
  featuredImageUrl?: string;
  featuredImageAlt?: string;
}

// Pages can have different templates
export enum PageTemplate {
  DEFAULT = "default",
  HOMEPAGE = "templates/homepage.php",
  FULL_WIDTH = "templates/full-width.php",
  SIDEBAR = "templates/sidebar.php",
  BLOG_INDEX = "templates/blog-index.php",
  EVALUATION = "templates/evaluation.php",
  CIRCLE_CHART = "templates/circle-chart.php",
  CONTACT = "templates/contact.php",
  MODULAR = "modular",
}

// Menu types
export interface MenuItem {
  ID: number;
  id?: number;
  title: string;
  url: string;
  slug: string;
  target: string;
  children?: MenuItem[];
}

// Site info type
export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
}

// Gallery item type
export interface GalleryItem {
  id: number;
  image: string;
  title?: string;
  description?: string;
}

export interface PageParams {
  params: {
    slug: string;
  };
}
