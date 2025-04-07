import { fetchApi } from "./baseApi";
import { Post } from "@/lib/types/contentTypes";
import { WordPressPost } from "@/lib/types/wordpressTypes";
import {
  adaptWordPressPost,
  adaptWordPressPosts,
} from "@/lib/adapters/postAdapter";
import { getOptimalImageSize } from "@/lib/imageUtils";

interface FetchPostsParams {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
  orderBy?: string;
  order?: "asc" | "desc";
}

export async function fetchPosts(params: FetchPostsParams = {}): Promise<Post[]> {
  try {
    const {
      page = 1,
      perPage = 12,
      search,
      categories,
      tags,
      orderBy = "date",
      order = "desc",
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: orderBy,
      order,
      _embed: "true",
    });

    if (search) queryParams.append("search", search);
    if (categories?.length) queryParams.append("categories", categories.join(","));
    if (tags?.length) queryParams.append("tags", tags.join(","));

    const posts = await fetchApi<WordPressPost[]>(`/wp/v2/posts?${queryParams.toString()}`, {
      revalidate: 3600,
    });

    const adaptedPosts = adaptWordPressPosts(posts);
    return adaptedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const posts = await fetchApi<WordPressPost[]>(`/wp/v2/posts?slug=${slug}&_embed`, {
      revalidate: 1200,
    });

    if (!Array.isArray(posts) || posts.length === 0) {
      return null;
    }

    const post = posts[0];
    const adaptedPost = adaptWordPressPost(post);
    if (!adaptedPost) return null;

    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

    return {
      ...adaptedPost,
      link: adaptedPost.link ?? "",
      featured_image_url: featuredMedia ? getOptimalImageSize(featuredMedia, "large") : null,
      featured_image: adaptedPost.featured_image ?? null,
      categories: adaptedPost.categories ?? [],
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function fetchPostsByIds(ids: number[]): Promise<Post[]> {
  try {
    if (!ids.length) return [];

    const posts = await fetchApi<WordPressPost[]>(
      `/wp/v2/posts?include=${ids.join(",")}&_embed`,
      { revalidate: 60 }
    );

    const adaptedPosts = adaptWordPressPosts(posts);
    return adaptedPosts;
  } catch (error) {
    console.error("Error in fetchPostsByIds:", error);
    return [];
  }
}

export async function fetchFeaturedPosts(count = 3): Promise<Post[]> {
  try {
    const featuredTagId = 17;
    const posts = await fetchApi<WordPressPost[]>(
      `/wp/v2/posts?_embed&per_page=${count}&categories=${featuredTagId}`,
      { revalidate: 3600 }
    );

    const adaptedPosts = adaptWordPressPosts(posts);
    return adaptedPosts;
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
}
