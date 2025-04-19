// lib/types/debugLogTypes.ts

export interface DebugLogData {
  [key: string]: unknown;
}

export interface DebugLog {
  id: number;
  data: DebugLogData;
  timestamp: number;
  type: string;
  level: string;
  message: string;
}

export interface DebugLogList {
  logs: DebugLog[];
  total: number;
  page: number;
  per_page: number;
  search: string;
  sort: string;
  order: string;
  filters: Record<string, string[]>;
}

// Data shapes for debug data builders
export interface BlogPost {
  id: number;
  title?: string;
  slug?: string;
  content?: string;
  featured_image_url?: string;
  [key: string]: unknown;
}

export interface BlogCategory {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface BlogUser {
  id: number;
  [key: string]: unknown;
}

export interface Page {
  id?: number;
  title?: string;
  slug?: string;
  template?: string;
  content?: string;
  featured_image_url?: string;
  [key: string]: unknown;
}

export interface Post {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  featured_image_url?: string;
  [key: string]: unknown;
}

export interface User {
  id?: number;
  [key: string]: unknown;
}