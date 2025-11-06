// src/lib/api.ts
import { Page, Post, SiteInfo, MenuItem } from "./types/contentTypes";
import { getOptimalImageSize } from "./imageUtils";

export * from "./api/index";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const THEME_SLUG = process.env.NEXT_PUBLIC_THEME_SLUG;
const DISABLE_CACHE = process.env.NEXT_PUBLIC_DISABLE_CACHE === 'true';

if (!API_URL) {
  throw new Error("API_URL is not defined");
}

if (!THEME_SLUG) {
  throw new Error("THEME_SLUG is not defined");
}

async function fetchAPI(
  endpoint: string,
  options: { revalidate?: number } = {}
) {
  const url = `${API_URL}${endpoint}`;
  console.log("Fetching:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      // If DISABLE_CACHE is true, set revalidate to 0, otherwise use specified value or default to 60 seconds
      next: { revalidate: DISABLE_CACHE ? 0 : (options.revalidate ?? 60) },
    });

    if (!response.ok) {
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function testConnection() {
  try {
    return await fetchAPI(`/${THEME_SLUG}/v1/test`);
  } catch (error) {
    console.error("API Connection Error:", error);
    throw error;
  }
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    // Cache posts list for 1 hour
    const posts = await fetchAPI("/wp/v2/posts?_embed&per_page=12", {
      revalidate: 3600,
    });

    // Map the response to match our Post interface
    return Array.isArray(posts)
      ? posts.map((post: Post) => ({
          id: post.id,
          slug: post.slug,
          title: {
            rendered: post.title.rendered,
          },
          excerpt: {
            rendered: post.excerpt?.rendered ?? "",
          },
          content: {
            rendered: post.content.rendered,
          },
          // Use the properly typed featured_image property
          featured_image: post._embedded?.["wp:featuredmedia"]?.[0] || null,
          featured_image_url:
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
          categories: post.categories || [],
        }))
      : [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const posts = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed`, {
      revalidate: 1200,
    });

    if (!Array.isArray(posts) || posts.length === 0) {
      return null;
    }

    const post = posts[0];
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];

    return {
      id: post.id,
      slug: post.slug,
      title: {
        rendered: post.title.rendered,
      },
      excerpt: {
        rendered: post.excerpt.rendered,
      },
      content: {
        rendered: post.content.rendered,
      },
      // Use the properly typed featured_image property
      featured_image: featuredMedia || null,
      featured_image_url: featuredMedia
        ? getOptimalImageSize(featuredMedia, "large")
        : null,
      categories: post.categories || [],
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// Fetch all categories
export async function fetchCategories(): Promise<
  Record<number, { id: number; name: string; slug: string }>
> {
  try {
    const categories = await fetchAPI("/wp/v2/categories", {
      revalidate: 3600, // Cache for 1 hour
    });

    return Array.isArray(categories)
      ? Object.fromEntries(
          categories.map((category) => [category.id, category])
        )
      : {};
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {};
  }
}

// Fetch featured posts
export async function fetchFeaturedPosts(
  options: number | { categories?: string; per_page?: number } = 3
): Promise<Post[]> {
  try {
    const featuredTagId = 17; // Actual "fokus" tag ID (17)
    
    // Determine the parameters based on options type
    let per_page: number;
    let categories: string | undefined;
    
    if (typeof options === 'number') {
      per_page = options;
      categories = String(featuredTagId);
    } else {
      per_page = options.per_page || 3;
      categories = options.categories || String(featuredTagId);
    }
    
    // Build the API endpoint with query parameters
    const endpoint = `/wp/v2/posts?_embed&per_page=${per_page}${categories ? `&categories=${categories}` : ''}`;
    
    const posts = await fetchAPI(endpoint, {
      revalidate: 3600, // Cache for 1 hour
    });

    // Map the response to match our Post interface
    return Array.isArray(posts)
      ? posts.map((post: Post) => ({
          // Use the properly typed featured_image property
          featured_image: post._embedded?.["wp:featuredmedia"]?.[0] || null,
          id: post.id,
          slug: post.slug,
          title: {
            rendered: post.title.rendered,
          },
          excerpt: {
            rendered: post.excerpt?.rendered ?? "",
          },
          content: {
            rendered: post.content.rendered,
          },
          featured_image_url:
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
          categories: post.categories || [],
        }))
      : [];
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
}

export async function fetchSiteInfo(): Promise<SiteInfo> {
  try {
    // Cache site info for 1 hour
    const data = await fetchAPI(`/${THEME_SLUG}/v1/site-info`, {
      revalidate: 3600,
    });
    return {
      name: data.name || "Site Name",
      description: data.description || "Site Description",
      url: data.url,
      admin_email: data.admin_email,
      language: data.language,
    };
  } catch (error) {
    console.error("Error fetching site info:", error);
    return {
      name: "Site Name",
      description: "Site Description",
    };
  }
}

export async function fetchMainMenu(): Promise<MenuItem[]> {
  try {
    // Cache menu for 1 hour
    const data = await fetchAPI(`/${THEME_SLUG}/v1/menu/primary`, {
      revalidate: 3600,
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}

export async function fetchPages(): Promise<Page[]> {
  try {
    // Cache pages list for 20 minutes
    const pages = await fetchAPI("/wp/v2/pages?_embed", { revalidate: 1200 });

    return Array.isArray(pages)
      ? pages.map((page: Page) => ({
          id: page.id,
          slug: page.slug,
          title: {
            rendered: page.title.rendered,
          },
          excerpt: {
            rendered: page.excerpt?.rendered ?? "",
          },
          content: {
            rendered: page.content.rendered,
          },
          featured_image_url:
            page._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
          template: page.template || "",
          _embedded: page._embedded,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

export async function fetchPage(slug: string): Promise<Page | null> {
  try {
    // Reduce cache time during testing to see changes immediately
    const pages = await fetchAPI(`/wp/v2/pages?slug=${slug}&_embed`, {
      revalidate: 10, // Reduce from 1200 to 10 seconds during testing
    });

    if (!Array.isArray(pages) || pages.length === 0) {
      return null;
    }

    const page = pages[0];

    // Log full page data to see what's coming from the API
    console.log(`Page data for slug "${slug}":`, {
      content: page.content?.rendered?.substring(0, 100),
      meta: page.meta,
      modules: page.modules?.length,
      content_display_settings: page.content_display_settings
    });

    return {
      id: page.id,
      slug: page.slug,
      title: {
        rendered: page.title.rendered,
      },
      excerpt: {
        rendered: page.excerpt.rendered,
      },
      content: {
        rendered: page.content.rendered,
      },
      featured_image_url:
        page._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      template: page.template || "",
      _embedded: page._embedded,
      meta: page.meta,
      modules: page.modules,
      content_display_settings: page.content_display_settings,
      show_content_with_modules: page.show_content_with_modules, // For backwards compatibility
    };
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function fetchHomepageData(): Promise<Record<string, unknown>> {
  try {
    const [response, categories, modulesResponse] = await Promise.all([
      fetch(`${API_URL}/steget/v1/modules?category=homepage`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }),
      fetchCategories(),
      fetch(`${API_URL}/steget/v1/modules?category=homepage`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }),
    ]);

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.status}`);
    }

    if (!modulesResponse.ok) {
      console.warn(`Failed to fetch modules: ${modulesResponse.status}`);
    }

    const homepageData = await response.json();
    const modulesData = await modulesResponse.json();

    // Fetch featured posts or fallback to the latest 3 posts
    const featuredPosts = homepageData.featured_post_ids?.length
      ? await fetchPostsByIds(homepageData.featured_post_ids)
      : await fetchFeaturedPosts(3);

    return {
      ...homepageData,
      featured_posts: featuredPosts,
      categories,
      modules: modulesData.modules || [], // Add modules to the returned data
    };
  } catch (error) {
    console.error("Error in fetchHomepageData:", error);
    throw error;
  }
}

/**
 * Fetches posts by their IDs
 */
export async function fetchPostsByIds(ids: number[]): Promise<Post[]> {
  try {
    const response = await fetch(
      `${API_URL}/wp-json/wp/v2/posts?include=${ids.join(",")}&_embed=true`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts by IDs: ${response.status}`);
    }

    const posts = await response.json();

    // Process posts to add featured image URL
    return posts.map((post: Post) => ({
      ...post,
      featured_image_url:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }));
  } catch (error) {
    console.error("Error in fetchPostsByIds:", error);
    throw error;
  }
}
