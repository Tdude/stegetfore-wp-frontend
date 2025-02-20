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
}
