// src/lib/types/componentTypes.ts
import { LocalPage } from "./contentTypes";
// For breaking circular dependencies, we'll define interfaces that are minimal
// and don't require specific module types

// Define minimal types for posts and homepage data to avoid circular imports
export interface MinimalPost {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  categories?: number[];
  slug?: string;
}

/**
 * Props for page templates
 */
export interface PageTemplateProps<T = Record<string, unknown>> {
  page: LocalPage;
  additionalData?: T;
}

/**
 * Props for the PageTemplateSelector component
 */
export interface PageTemplateSelectorProps {
  page: LocalPage;
  isHomePage?: boolean;
  homepageData?: Record<string, unknown>; 
}

/**
 * Props for the HomepageTemplate component
 */
export interface HomepageTemplateProps extends PageTemplateProps {
  homepage?: Record<string, unknown>; 
}

/**
 * Props for the CircleChartTemplate component
 */
export interface CircleChartTemplateProps {
  chartData?: {
    segments: number[];
  };
  title?: string;
}

/**
 * Props for the EvaluationTemplate component
 */
export interface EvaluationTemplateProps {
  evaluationId?: number;
}

/**
 * Props for the ModularTemplate component
 */
export interface ModularTemplateProps {
  page: LocalPage;
}

/**
 * Props for the ModuleRenderer component
 */
export interface ModuleRendererProps {
  module: unknown; 
  className?: string;
}

/**
 * Props for the HeroSection component
 */
export interface HeroSectionProps {
  title: string;
  intro?: string;
  imageUrl: string | string[] | null | false;
  ctaButtons?: Array<{
    text: string;
    url: string;
    style: "primary" | "secondary" | "outline";
  }>;
}

/**
 * Props for the SellingPoints component
 */
export interface SellingPointsProps {
  points: Array<{
    id: number;
    title: string;
    content: string;
    description?: string;
    icon?: string;
  }>;
  title?: string;
}

/**
 * Props for the FeaturedPosts component
 */
export interface FeaturedPostsProps {
  posts: MinimalPost[];
  title?: string;
  categories?: Record<number, { id: number; name: string; slug: string }>;
}

/**
 * Props for the TestimonialsSection component
 */
export interface TestimonialsSectionProps {
  testimonials: Array<{
    id: number;
    content: string;
    author_name: string;
    author_position: string;
    author_image?: string;
  }>;
  title: string;
}

/**
 * Props for the StatsSection component
 */
export interface StatsSectionProps {
  stats: Array<{
    id: number;
    value: string;
    label: string;
  }>;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

/**
 * Props for the GallerySection component
 */
export interface GallerySectionProps {
  items: Array<{
    id: number;
    image: string;
    title?: string;
    description?: string;
  }>;
  title?: string;
}

/**
 * Props for the ModularPage component
 */
export interface ModularPageProps {
  modules: unknown[]; 
  className?: string;
  sectionLayouts?: Record<string, string>;
  headerClassName?: string;
  mainClassName?: string;
  sidebarClassName?: string;
  footerClassName?: string;
}

/**
 * Props for the header component
 */
export interface HeaderProps {
  siteInfo: {
    name: string;
    description: string;
  };
  menuItems: Array<{
    ID: number;
    title: string;
    url: string;
    slug: string;
    target: string;
    children?: Array<{
      ID: number;
      title: string;
      url: string;
      slug: string;
      target: string;
    }>;
  }>;
}

// Image container types for the OptimizedImage component
export type ImageContainer =
  | "hero"
  | "featured"
  | "card"
  | "gallery"
  | "default";
