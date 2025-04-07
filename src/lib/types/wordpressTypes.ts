// lib/types/wordpressTypes.ts

import type { BaseContent, MediaEmbed } from './coreTypes';

/**
 * WordPress raw post data from REST API
 */
export interface WordPressPost extends Omit<BaseContent, '_embedded'> {
  _embedded?: {
    'wp:featuredmedia'?: MediaEmbed[];
    author?: Array<{
      name: string;
      avatar_urls: Record<string, string>;
    }>;
  };
  link?: string;
  type?: string;
  excerpt?: { rendered: string };
  author: number | string;
  categories?: number[] | string[];
  tags?: number[];
  meta?: Record<string, any>;
  comment_status?: "open" | "closed";
}

/**
 * Generic WordPress API response wrapper
 */
export interface WordPressApiResponse<T> {
  data?: T;
  status: number;
  message?: string;
}

/**
 * WordPress page data from REST API
 */
export interface WordPressPage extends BaseContent {
  parent?: number;
  menu_order?: number;
  comment_status?: "open" | "closed";
  meta?: {
    student_id?: string | number;
    [key: string]: any;
  };
}

/**
 * WordPress module response
 */
export interface WordPressModuleResponse {
  modules?: Array<WordPressModule>;
  [key: string]: any;
}

/**
 * WordPress module data structure
 */
export interface WordPressModule {
  id: number;
  type: string;
  title?: string;
  content?: string;
  [key: string]: any;
}

/**
 * Homepage specific response from WordPress
 */
export interface WordPressHomepageResponse {
  title?: string;
  description?: string;
  featured_image?: string;
  modules?: any[];
  featured_posts?: WordPressPost[];
  categories?: Record<string, any>;
  settings?: Record<string, any>;
}
