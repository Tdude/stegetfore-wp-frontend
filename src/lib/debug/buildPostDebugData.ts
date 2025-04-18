import { API_URL } from '../api/baseApi';
import { DebugLogData, Post, User } from '../types/debugLogTypes';

interface PostDebugData extends DebugLogData {
  'Page Type': string;
  'Post ID': number | undefined;
  'Title': string | undefined;
  'Slug': string | undefined;
  'Has Content': boolean;
  'Content Length': number;
  'Featured Image': string;
  'Endpoints Used': string[];
  'Env': Record<string, string | undefined>;
  'Is Authenticated'?: boolean;
  [key: string]: unknown;
}

export function buildPostDebugData(post: Post, user?: User): PostDebugData {
  return {
    'Page Type': 'Single Post',
    'Post ID': post?.id,
    'Title': post?.title,
    'Slug': post?.slug,
    'Has Content': !!post?.content,
    'Content Length': post?.content?.length || 0,
    'Featured Image': post?.featured_image_url ? 'Yes' : 'None',
    'Endpoints Used': [
      `${API_URL}/wp/v2/posts?slug=${post?.slug}&_embed`
    ],
    'Env': {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    },
    'Is Authenticated': !!user,
    'id': post?.id,
    'data': post,
    'timestamp': Date.now(),
    'type': 'page',
    'level': 'info',
    'message': 'Page Debug Data'
  };
}
