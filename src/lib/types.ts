// lib/types.ts
export interface Post {
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_image_url?: string;
}
