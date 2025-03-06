// src/lib/types/componentTypes.ts
import { LocalPage, Post } from "./contentTypes";
import { HomepageData, Module } from "./moduleTypes";

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
  homepageData?: HomepageData;
}

/**
 * Props for the HomepageTemplate component
 */
export interface HomepageTemplateProps extends PageTemplateProps {
  homepage?: HomepageData | string; // Could be either a string (from API) or parsed object
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
 * Props for the progress bar component
 */
export interface ProgressBarProps {
  value: number;
  type: "section" | "total";
  stage?: "ej" | "trans" | "full";
}

/**
 * Props for the SubSection component in the evaluation template
 */
export interface SubSectionProps {
  title: string;
  name: string;
  options: Array<{
    value: string;
    label: string;
    stage: "ej" | "trans" | "full";
  }>;
  value: string;
  onChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  comment: string;
  sectionKey: keyof FormData;
  fieldName: string;
  calculateProgress: (section: keyof FormData, field: string) => number;
}

/**
 * Props for the ModuleRenderer component
 */
export interface ModuleRendererProps {
  module: Module;
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
  posts: Post[];
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
 * Props for the CTASection component
 */
export interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
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
  modules: Module[];
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
