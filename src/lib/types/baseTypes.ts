// types/baseTypes.ts
// Contains commonly used type definitions across the application

// Import types from contentTypes where they're properly defined
import type { BaseContent, Post, Page, LocalPage } from './contentTypes';

// Re-export for backward compatibility
export type { BaseContent, Post, Page, LocalPage };

// Removed unused 'ProcessEnv' interface to resolve lint error

// Image container types for the OptimizedImage component
export type ImageContainer =
  | "hero"
  | "featured"
  | "card"
  | "gallery"
  | "default";

// Image-related helper functions
export interface ImageHelper {
  getImageUrl: (media: unknown, size?: string) => string;
  getImageAlt: (media: unknown, fallback?: string) => string;
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
  params: Promise<{
    slug: string;
  }>;
}
