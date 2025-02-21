// src/lib/types.ts
export interface Post {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_image_url?: string;
}

export interface MenuItem {
  ID: number;
  title: string;
  url: string;
  slug: string;
  target: string;
}

export interface SiteInfo {
  name: string;
  description: string;
  url?: string;
  admin_email?: string;
  language?: string;
}

export interface Page {
  template: string;
  acf?: any;
  meta?: {
    _wp_page_template?: string;
  };
}

export enum PageTemplate {
  DEFAULT = "default",
  FULL_WIDTH = "templates/full-width.php",
  SIDEBAR = "templates/sidebar.php",
  LANDING = "templates/landing.php",
  // Add other templates?
}
