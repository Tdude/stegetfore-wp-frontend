// src/lib/types.ts - Application Types Section

import * as React from "react";
import {
  // WordPressPost,
  // WordPressPage,
  // WordPressCategory,
  // WordPressSellingPoint,
  // WordPressStat,
  // WordPressGalleryItem,
  // WordPressTestimonial,
  // WordPressCTA,
  // WordPressHomepageData,
  WordPressWPCF7Form,
  WordPressWPCF7SubmissionResponse,
} from "./types-wordpress";

// Base types with common fields for application use
interface BaseContent {
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
}

// Generic props type for all page templates
export interface PageTemplateProps<T = Record<string, any>> {
  page: LocalPage;
  additionalData?: T;
}

// Pages can have different templates
export enum PageTemplate {
  DEFAULT = "default",
  HOMEPAGE = "templates/homepage.php",
  FULL_WIDTH = "templates/full-width.php",
  SIDEBAR = "templates/sidebar.php",
  LANDING = "templates/landing.php",
  EVALUATION = "templates/evaluation.php",
  CIRCLE_CHART = "templates/circle-chart.php",
  CONTACT = "templates/contact",
}

// More specific content types extending base content for application use
export interface Post extends BaseContent {
  id: number;
  slug: string;
  categories: number[];
}

export interface Page extends BaseContent {
  chartData?: {
    segments: number[];
  } | null;
}

// Enhanced local version with more strict typing
export interface LocalPage extends BaseContent {
  id: number;
  slug: string;
  chartData?: {
    segments: number[];
  } | null;
  evaluationId?: string;
  type?: string;
}

// Form data interfaces
export interface FormData {
  anknytning: {
    narvaro: string;
    dialog1: string;
    dialog2: string;
    blick: string;
    beroring: string;
    konflikt: string;
    fortroende: string;
    comments: Record<string, string>;
  };
  ansvar: {
    impulskontroll: string;
    forberedd: string;
    fokus: string;
    turtagning: string;
    instruktion: string;
    arbeta_sjalv: string;
    tid: string;
    comments: Record<string, string>;
  };
}

export interface LocalFormData {
  anknytning: {
    narvaro: string;
    dialog1: string;
    dialog2: string;
    blick: string;
    beroring: string;
    konflikt: string;
    fortroende: string;
    comments: Record<string, string>;
  };
  ansvar: {
    impulskontroll: string;
    forberedd: string;
    fokus: string;
    turtagning: string;
    instruktion: string;
    arbeta_sjalv: string;
    tid: string;
    comments: Record<string, string>;
  };
}

// Initial form state
export const initialFormState: LocalFormData = {
  anknytning: {
    narvaro: "",
    dialog1: "",
    dialog2: "",
    blick: "",
    beroring: "",
    konflikt: "",
    fortroende: "",
    comments: {},
  },
  ansvar: {
    impulskontroll: "",
    forberedd: "",
    fokus: "",
    turtagning: "",
    instruktion: "",
    arbeta_sjalv: "",
    tid: "",
    comments: {},
  },
};

// Homepage related interfaces
// In your types.ts file, update the HomepageData interface to use the GalleryItem type

export interface HomepageData {
  featured_posts?: Post[];
  categories?: Record<number, { id: number; name: string; slug: string }>;
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
  gallery?: GalleryItem[];
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
  [key: string]: unknown;
}

// Component Props
export interface PageTemplateSelectorProps {
  page: LocalPage;
  isHomePage?: boolean;
  homepageData?: HomepageData;
}

export interface HomepageTemplateProps extends PageTemplateProps {
  homepage?: HomepageData | string; // Could be either a string (from API) or parsed object
}

export interface CircleChartTemplateProps {
  chartData?: {
    segments: number[];
  };
  title?: string;
}

export interface EvaluationTemplateProps {
  evaluationId?: number;
}

// UI Component props
export interface MenuItemProps {
  item: MenuItem;
  className?: string;
}

export interface MenuItem {
  ID: number;
  id?: number; // Added for compatibility
  title: string;
  url: string;
  slug: string;
  target: string;
  children?: MenuItem[];
}

export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
}

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

export interface HeroSectionProps {
  title: string;
  intro: string;
  imageUrl: string | string[] | null | false;
  ctaButtons?: Array<{
    text: string;
    url: string;
    style: "primary" | "secondary" | "outline";
  }>;
}

export interface LifeWheelChartProps {
  className?: string;
  chartData?: {
    segments: number[];
  };
  title?: string;
}

export interface SellingPointsProps {
  points: Array<{
    id: number;
    title: string;
    content: string; // HTML content (required to match HomepageData)
    description?: string;
    icon?: string;
  }>;
  title?: string; // Optional section title
}

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

export interface GalleryItem {
  id: number;
  image: string;
  title?: string;
  description?: string;
}

export interface GallerySectionProps {
  items: GalleryItem[];
  title?: string;
}

export interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
}

export interface FeaturedPostsProps {
  posts: Post[];
  title?: string;
}

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

export interface ProgressBarProps {
  value: number;
  type: "section" | "total";
  stage?: "ej" | "trans" | "full";
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Type aliases for backward compatibility
export type WPCF7Form = WordPressWPCF7Form;
export type WPCF7SubmissionResponse = WordPressWPCF7SubmissionResponse;
