// src/lib/types/moduleTypes.ts

/**
 * Base module interface
 */
export interface BaseModule {
  id: number;
  type: string;
  title?: string;
  content?: string;
  template?: string; // Keep for reference
  featured_image?: string;
  layout?: string;
  fullWidth?: boolean;
  backgroundColor?: string;
  buttons?: Array<{
    text: string;
    url: string;
    style:
      | "primary"
      | "secondary"
      | "outline"
      | "link"
      | "ghost"
      | "default"
      | "destructive";
    new_tab?: boolean; // Added to match the API
  }>;
  order?: number;
  status?: "publish" | "draft";
  settings?: Record<string, unknown>;
  originalType?: string; // For debugging purposes
  categories?: string | string[];
  placements?: string[] | string;
}

/**
 * Hero module
 */
export interface HeroModule extends BaseModule {
  type: "hero";
  title: string;
  description?: string;
  intro?: string; // Added to match the API
  image: string | string[];
  video_url?: string;
  overlay_opacity?: number; // Matches API
  overlayOpacity?: number; // Optional alias for consistency
  text_color?: string; // Matches API
  textColor?: string; // Optional alias for consistency
  backgroundColor?: string;
  height?: "small" | "medium" | "large" | string; // Updated to match API
  alignment?: "left" | "center" | "right"; // Matches API
}

/**
 * CTA (Call To Action) module
 */
export interface CTAModule extends BaseModule {
  type: "cta";
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  image?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  containerType?: "featured" | "hero" | "background";
}

/**
 * Selling Points module
 */
export interface SellingPointsModule extends BaseModule {
  type: "selling-points";
  title?: string;
  points: Array<{
    id: number;
    title: string;
    content: string;
    description?: string;
    icon?: string;
  }>;
  layout?: "grid" | "list" | "carousel";
  columns?: 1 | 2 | 3 | 4;
  backgroundColor?: string;
}

/**
 * Testimonials module
 */
export interface TestimonialsModule extends BaseModule {
  type: "testimonials";
  title?: string;
  testimonials: Array<{
    id: number;
    content: string;
    author_name: string;
    author_position?: string;
    author_image?: string;
  }>;
  display_style?: "carousel" | "grid" | "list";
  display_count?: number;
}

/**
 * Category type for modules
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  [key: string]: unknown;
}

/**
 * Featured Posts module
 */
export interface FeaturedPostsModule extends BaseModule {
  type: 'featured-posts';
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  categories?: string | string[];
  categoriesData?: Category[];
  post_count?: number;
  columns?: number;
  display_style?: 'grid' | 'list' | 'carousel';
  show_categories?: boolean;
  show_date?: boolean;
  show_excerpt?: boolean;
  show_button?: boolean;
  button_text?: string;
  show_view_all?: boolean;
  view_all_url?: string;
  view_all_text?: string;
  show_author?: boolean;
  show_read_more?: boolean;
  posts: unknown[];
}

/**
 * Stats module
 */
export interface StatsModule extends BaseModule {
  type: "stats";
  title?: string;
  subtitle?: string;
  stats: Array<{
    id: number;
    value: string;
    label: string;
    icon?: string;
  }>;
  backgroundColor?: string;
  layout?: "row" | "grid";
  columns?: 2 | 3 | 4;
}

/**
 * Gallery module
 */
export interface GalleryModule extends BaseModule {
  type: "gallery";
  title?: string;
  items: Array<{
    id: number;
    image: string;
    title?: string;
    description?: string;
  }>;
  layout?: "grid" | "carousel" | "masonry";
  columns?: 2 | 3 | 4;
  enable_lightbox?: boolean;
}

/**
 * Text module
 */
export interface TextModule extends BaseModule {
  type: "text";
  title?: string;
  content: string;
  alignment?: "left" | "center" | "right";
  text_size?: "small" | "medium" | "large";
  enable_columns?: boolean;
  columns_count?: 2 | 3;
}

/**
 * Form module
 */
export interface FormModule extends BaseModule {
  type: "form";
  title?: string;
  form_id: number;
  description?: string;
  success_message?: string;
  error_message?: string;
  redirect_url?: string;
}

/**
 * Accordion module
 */
export interface AccordionFaqItem {
  id?: number;
  question: string;
  answer: string;
  icon?: string;
}

// Define the module interface
export interface AccordionFaqModule extends BaseModule {
  type: "accordion" | "faq";
  items: AccordionFaqItem[];
  allow_multiple_open?: boolean;
  default_open_index?: number;
  backgroundColor?: string;
  icon_position?: "left" | "right";
}

/**
 * Tabs module
 *
 */
export interface TabsModule extends BaseModule {
  type: "tabs";
  title?: string;
  tabs: Array<{
    id: number;
    title: string;
    content: string;
    icon?: string;
  }>;
  orientation?: "horizontal" | "vertical";
  default_tab_index?: number;
  order?: number;
  typeOrder?: number;
  index: number;
}

/**
 * Video module
 */
export interface VideoModule extends BaseModule {
  type: "video";
  title?: string;
  video_url: string;
  video_type?: "youtube" | "vimeo" | "local";
  poster_image?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  allow_fullscreen?: boolean;
}

/**
 * Chart module
 */
export interface ChartModule extends BaseModule {
  type: "chart";
  title?: string;
  chart_type: "bar" | "line" | "pie" | "doughnut" | "radar";
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }>;
  };
  options?: Record<string, unknown>;
}

/**
 * Union type of all module types
 */
export type Module =
  | HeroModule
  | CTAModule
  | SellingPointsModule
  | TestimonialsModule
  | FeaturedPostsModule
  | StatsModule
  | GalleryModule
  | TextModule
  | FormModule
  | AccordionFaqModule
  | TabsModule
  | VideoModule
  | ChartModule
  | BaseModule;
