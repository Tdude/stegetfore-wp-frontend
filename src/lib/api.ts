// src/lib/api.ts
import {
  Post,
  Page,
  SiteInfo,
  MenuItem,
  WPCF7Form,
  WPCF7SubmissionResponse,
  LocalPage,
  HomepageData,
} from "./types";

import {
  WordPressPost,
  WordPressPage,
  WordPressCategory,
  WordPressSiteInfo,
  WordPressMenuItem,
  WordPressHomepageData,
} from "./types-wordpress";

import {
  adaptWordPressPost,
  adaptWordPressPage,
  adaptWordPressPageToLocalPage,
  adaptWordPressHomepageData,
  adaptWordPressSiteInfo,
} from "./adapters";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const THEME_SLUG = process.env.NEXT_PUBLIC_THEME_SLUG;

if (!API_URL) {
  throw new Error("API_URL is not defined");
}

if (!THEME_SLUG) {
  throw new Error("THEME_SLUG is not defined");
}

async function fetchAPI<T>(
  endpoint: string,
  options: { revalidate?: number } = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  console.log("Fetching:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      // Default to 60 seconds if not specified
      next: { revalidate: options.revalidate ?? 60 },
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
    return data as T;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function testConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    return await fetchAPI<{ success: boolean; message: string }>(
      `/${THEME_SLUG}/v1/test`
    );
  } catch (error) {
    console.error("API Connection Error:", error);
    throw error;
  }
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    const posts = await fetchAPI<WordPressPost[]>(
      "/wp/v2/posts?_embed&per_page=12",
      {
        revalidate: 3600,
      }
    );

    // Use adapter to convert WordPress format to application format
    return Array.isArray(posts)
      ? posts.map((post) => adaptWordPressPost(post))
      : [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    // Cache individual posts for 20 minutes
    const posts = await fetchAPI<WordPressPost[]>(
      `/wp/v2/posts?slug=${slug}&_embed`,
      {
        revalidate: 1200,
      }
    );

    if (!Array.isArray(posts) || posts.length === 0) {
      return null;
    }

    return adaptWordPressPost(posts[0]);
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
    const categories = await fetchAPI<WordPressCategory[]>(
      "/wp/v2/categories",
      {
        revalidate: 3600, // Cache for 1 hour
      }
    );

    return Array.isArray(categories)
      ? Object.fromEntries(
          categories.map((category) => [
            category.id,
            {
              id: category.id,
              name: category.name,
              slug: category.slug,
            },
          ])
        )
      : {};
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {};
  }
}

// Fetch featured posts
export async function fetchFeaturedPosts(count: number = 3): Promise<Post[]> {
  try {
    const featuredTagId = 17; // Actual "fokus" tag ID (17)
    const posts = await fetchAPI<WordPressPost[]>(
      `/wp/v2/posts?_embed&per_page=${count}&categories=${featuredTagId}`,
      {
        revalidate: 3600, // Cache for 1 hour
      }
    );

    // Use adapter to convert WordPress format to application format
    return Array.isArray(posts)
      ? posts.map((post) => adaptWordPressPost(post))
      : [];
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
}

// Different cache times for different types of content
export async function fetchSiteInfo(): Promise<SiteInfo> {
  try {
    // Cache site info for 1 hour
    const data = await fetchAPI<WordPressSiteInfo>(
      `/${THEME_SLUG}/v1/site-info`,
      {
        revalidate: 3600,
      }
    );

    return adaptWordPressSiteInfo(data);
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
    const data = await fetchAPI<WordPressMenuItem[]>(
      `/${THEME_SLUG}/v1/menu/primary`,
      {
        revalidate: 3600,
      }
    );

    // Process menu items to ensure they match our MenuItem type
    const processMenuItems = (items: WordPressMenuItem[]): MenuItem[] => {
      if (!Array.isArray(items)) return [];

      return items.map((item) => ({
        ID: item.ID || item.id || 0,
        title: item.title || "",
        url: item.url || "",
        slug: item.slug || (item.url ? item.url.replace(/^\/|\/$/g, "") : ""),
        target: item.target || "",
        children: item.children ? processMenuItems(item.children) : undefined,
      }));
    };

    return Array.isArray(data) ? processMenuItems(data) : [];
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}

export async function fetchPages(): Promise<LocalPage[]> {
  try {
    // Cache pages list for 20 minutes
    const pages = await fetchAPI<WordPressPage[]>("/wp/v2/pages?_embed", {
      revalidate: 1200,
    });

    return Array.isArray(pages)
      ? pages.map((page) => adaptWordPressPageToLocalPage(page))
      : [];
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

export async function fetchPage(slug: string): Promise<LocalPage | null> {
  try {
    // Cache individual pages for 20 minutes
    const pages = await fetchAPI<WordPressPage[]>(
      `/wp/v2/pages?slug=${slug}&_embed`,
      {
        revalidate: 1200,
      }
    );

    if (!Array.isArray(pages) || pages.length === 0) {
      return null;
    }

    return adaptWordPressPageToLocalPage(pages[0]);
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function fetchHomepageData(): Promise<HomepageData> {
  try {
    const [response, categories] = await Promise.all([
      fetch(`${API_URL}/startpage/v1/homepage-data`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }),
      fetchCategories(),
    ]);

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.status}`);
    }

    const homepageData = (await response.json()) as WordPressHomepageData;

    // Fetch featured posts or fallback to the latest 3 posts
    const featuredPosts = homepageData.featured_post_ids?.length
      ? await fetchPostsByIds(homepageData.featured_post_ids)
      : await fetchFeaturedPosts(3);

    // Use adapter to convert WordPress format to application format
    return {
      ...adaptWordPressHomepageData(homepageData, featuredPosts),
      categories, // Add the categories separately
    };
  } catch (error) {
    console.error("Error in fetchHomepageData:", error);
    throw error;
  }
}

export async function fetchPostsByIds(ids: number[]): Promise<Post[]> {
  try {
    // WordPress REST API allows fetching multiple posts by ID using the include parameter
    const posts = await fetchAPI<WordPressPost[]>(
      `/wp/v2/posts?_embed&include=${ids.join(",")}`,
      {
        revalidate: 3600, // Cache for 1 hour
      }
    );

    // Use adapter to convert WordPress format to application format
    return Array.isArray(posts)
      ? posts.map((post) => adaptWordPressPost(post))
      : [];
  } catch (error) {
    console.error("Error fetching posts by IDs:", error);
    return [];
  }
}

// Get WPCF7 Form by ID
export async function getContactForm(
  formId: number
): Promise<WPCF7Form | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contact form: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching contact form:", error);
    return null;
  }
}

// Submit WPCF7 Form
export async function submitContactForm(
  formId: number,
  formData: FormData
): Promise<WPCF7SubmissionResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
      {
        method: "POST",
        body: formData,
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      status: "mail_failed",
      message:
        "There was an error submitting the form. Please try again later.",
    };
  }
}
