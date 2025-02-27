// src/lib/types.ts - WordPress API Types Section
// Base WordPress API response interface
export interface WordPressBaseContent {
  id: number;
  slug: string;
  title?: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  template?: string;
  _embedded?: {
    "wp:featuredmedia"?: WordPressMedia[]; // Use WordPressMedia interface
  };
  date?: string;
  modified?: string;
  type?: string;
  status?: string;
  link?: string;
  [key: string]: unknown; // Allow for extension with other WordPress fields
}

// WordPress Post specific fields
export interface WordPressPost extends WordPressBaseContent {
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  author?: number;
  comment_status?: string;
}

// WordPress Page specific fields
export interface WordPressPage extends WordPressBaseContent {
  parent?: number;
  menu_order?: number;
  comment_status?: string;
  chartData?: {
    segments: number[];
  } | null;
}

// WordPress Category
export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
}

// WordPress Tag
export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

// WordPress Menu Item
export interface WordPressMenuItem {
  ID: number;
  id?: number; // Added for compatibility
  title: string;
  url: string;
  slug: string;
  target: string;
  children?: WordPressMenuItem[];
}

// WordPress Media
export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_type?: string;
  mime_type?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      {
        source_url: string;
        width: number;
        height: number;
      }
    >;
  };
}

// Custom content types from WordPress API
export interface WordPressSiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
}

// WordPress Contact Form 7
export interface WordPressWPCF7Form {
  id: number;
  title: string;
  properties: {
    form: string;
    mail: {
      subject: string;
      sender: string;
      body: string;
      recipient: string;
      additional_headers: string;
      attachments: string;
      use_html: boolean;
      exclude_blank: boolean;
    };
  };
}

export interface WordPressWPCF7SubmissionResponse {
  status:
    | "mail_sent"
    | "mail_failed"
    | "validation_failed"
    | "spam"
    | "aborted"
    | "unaccepted_terms";
  message: string;
  postedData?: Record<string, string>;
  invalidFields?: Array<{
    field: string;
    message: string;
  }>;
  into?: string;
}

// Custom API endpoints content types
export interface WordPressSellingPoint {
  id: number;
  title: string;
  content: string;
  description?: string;
  icon?: string;
}

export interface WordPressStat {
  id: number;
  value: string;
  label: string;
}

export interface WordPressGalleryItem {
  id: number;
  image: string;
  title?: string;
  description?: string;
}

export interface WordPressTestimonial {
  id: number;
  content: string;
  author_name: string;
  author_position: string;
  author_image?: string;
}

export interface WordPressCTA {
  title?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  background_color?: string;
}

// Custom HomepageData from API
export interface WordPressHomepageData {
  featured_posts?: WordPressPost[];
  featured_post_ids?: number[];
  categories?: Record<number, WordPressCategory>;
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
  selling_points?: WordPressSellingPoint[];
  stats?: WordPressStat[];
  stats_title?: string;
  stats_subtitle?: string;
  stats_background_color?: string;
  gallery?: WordPressGalleryItem[];
  testimonials?: WordPressTestimonial[];
  testimonials_title?: string;
  cta?: WordPressCTA;
  [key: string]: unknown; // Allow for extension
}
