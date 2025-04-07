// src/lib/types.ts - Application Types Section
/* eslint-disable @typescript-eslint/no-namespace */

// Re-export all types from the specialized files
// This maintains backward compatibility with existing code
export * from "./types/index";

// Environment variables type declaration
declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_WORDPRESS_URL: string;
    NEXT_PUBLIC_THEME_SLUG: string;
    REVALIDATION_TOKEN: string;
    HOMEPAGE_ID: string;
    NODE_ENV: "development" | "production" | "test";
  }
}

import * as React from "react";
import { Module } from './types/index';
import { BaseContent } from './types/coreTypes';
import { PageTemplate } from './types/index';

// The following types are kept for backward compatibility
// They are re-exported from the specialized type files

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

// Generic props type for all page templates
export interface PageTemplateProps<T = Record<string, unknown>> {
  page: import('./types/contentTypes').LocalPage;
  additionalData?: T;
}

// Form data interfaces - maintaining exact structure for backward compatibility
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

// Component Props - maintaining exact structure for backward compatibility
export interface PageTemplateSelectorProps {
  page: import('./types/contentTypes').LocalPage;
  isHomePage?: boolean;
  homepageData?: import('./types/contentTypes').HomepageData;
}

export interface HomepageTemplateProps {
  homepage?: import('./types/contentTypes').HomepageData | string;
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
  item: import('./types/contentTypes').MenuItem;
  className?: string;
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
  title?: string;
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

export interface FeaturedPostsProps {
  posts: import('./types/contentTypes').Post[];
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

/**
 * TextareaProps extends HTMLTextAreaAttributes (without adding new properties)
 * for type consistency across components
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Custom property for project-specific features */
  customProp?: string;
}
