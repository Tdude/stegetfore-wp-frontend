import { API_URL } from '../api/baseApi';

interface BlogDebugData {
  'Page Type': string;
  'Posts Count': number;
  'Categories Count': number;
  'Endpoints Used': string[];
  'Env': Record<string, string | undefined>;
  'Is Authenticated'?: boolean;
  [key: string]: unknown;
}

export function buildBlogDebugData(posts: any[], categories: any[], user?: any): BlogDebugData {
  return {
    'Page Type': 'Blog Index',
    'Posts Count': posts.length,
    'Categories Count': categories.length,
    'Endpoints Used': [
      `${API_URL}/wp/v2/posts`,
      `${API_URL}/wp/v2/categories`
    ],
    'Env': {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    },
    'Is Authenticated': !!user,
  };
}
