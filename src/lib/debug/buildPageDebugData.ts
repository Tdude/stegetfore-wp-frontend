import { API_URL } from '../api/baseApi'; 
import { DebugLogData, Page, User } from '../types/debugLogTypes';

interface PageDebugData extends DebugLogData {
  'Page Type': string;
  'Page ID': number | undefined;
  'Title': string | undefined;
  'Slug': string | undefined;
  'Template': string | undefined;
  'Has Content': boolean;
  'Content Length': number;
  'Featured Image': string;
  'Endpoints Used': string[];
  'Env': Record<string, string | undefined>;
  'Is Authenticated'?: boolean;
  [key: string]: unknown;
}

export function buildPageDebugData(page: Page, user?: User): PageDebugData {
  return {
    'Page Type': 'Page',
    'Page ID': page?.id,
    'Title': page?.title,
    'Slug': page?.slug,
    'Template': page?.template,
    'Has Content': !!page?.content,
    'Content Length': page?.content?.length || 0,
    'Featured Image': page?.featured_image_url ? 'Yes' : 'None',
    'Endpoints Used': [
      `${API_URL}/wp/v2/pages?slug=${page?.slug}&_embed`
    ],
    'Env': {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    },
    'Is Authenticated': !!user,
  };
}
