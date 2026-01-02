import { API_URL } from '../api/baseApi'; 
import { DebugLogData, User } from '../types/debugLogTypes';

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

export function buildPageDebugData(page: unknown, user?: User): PageDebugData {
  const title =
    typeof (page as unknown as { title?: unknown }).title === 'string'
      ? (page as unknown as { title?: string }).title
      : ((page as unknown as { title?: { rendered?: string } }).title?.rendered || undefined);

  const content =
    typeof (page as unknown as { content?: unknown }).content === 'string'
      ? (page as unknown as { content?: string }).content
      : ((page as unknown as { content?: { rendered?: string } }).content?.rendered || undefined);

  const slug = (page as unknown as { slug?: string }).slug;
  const template = (page as unknown as { template?: string }).template;
  const featuredImageUrl = (page as unknown as { featured_image_url?: string | null }).featured_image_url;

  return {
    'Page Type': 'Page',
    'Page ID': (page as { id?: number } | null)?.id,
    'Title': title,
    'Slug': slug,
    'Template': template,
    'Has Content': !!content,
    'Content Length': content?.length || 0,
    'Featured Image': featuredImageUrl ? 'Yes' : 'None',
    'Endpoints Used': [
      `${API_URL}/wp/v2/pages?slug=${slug}&_embed`
    ],
    'Env': {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    },
    'Is Authenticated': !!user,
  };
}
