// src/lib/api.ts
import {
  Post,
  // Page,
  SiteInfo,
  MenuItem,
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
  WPCF7Form,
  WPCF7SubmissionResponse,
} from "./types-wordpress";

import {
  adaptWordPressPost,
  // adaptWordPressPage,
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

/**
 * Fetches Contact Form 7 structure from the custom WordPress endpoint
 */
export async function fetchContactForm(formId: string): Promise<WPCF7Form> {
  const endpoint = `${API_URL}/steget/v1/cf7/form/${formId}`;

  console.log(`Fetching form from endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorDetails = "";
      try {
        // Try to get detailed error message
        errorDetails = await response.text();
      } catch (e) {
        errorDetails = "Could not extract error details";
      }

      console.error(
        `Error fetching form: ${response.status} ${response.statusText}`
      );
      console.error(`Error details: ${errorDetails}`);
      throw new Error(`Failed to fetch form: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Form data received:", data);

    // Validate the form structure
    if (!data || !data.fields || !Array.isArray(data.fields)) {
      console.error("Invalid form structure received:", data);
      throw new Error("Invalid form structure received from API");
    }

    return data as WPCF7Form;
  } catch (error) {
    console.error("Error in fetchContactForm:", error);
    throw error;
  }
}

/**
 * Submits Contact Form 7 data with enhanced debugging
 */
export async function submitContactForm(
  formId: string,
  formData: FormData
): Promise<WPCF7SubmissionResponse> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://stegetfore.nu/wp-json";
  const endpoint = `${API_URL}/steget/v1/cf7/submit/${formId}`;

  console.log(`Submitting form to endpoint: ${endpoint}`);

  // Log the form data being sent
  console.log("Form data being submitted:");
  const formDataObj: Record<string, any> = {};
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
    formDataObj[pair[0]] = pair[1];
  }

  // Create a JSON version of the form data for fallback
  const jsonData = JSON.stringify(formDataObj);
  console.log("JSON version of form data:", jsonData);

  try {
    // Try using FormData first (preferred method)
    console.log("Attempting submission with FormData...");
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });

    // If that fails, try using JSON
    if (!response.ok && response.status === 500) {
      console.log("FormData submission failed. Trying JSON approach...");
      const jsonResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
        mode: "cors",
        credentials: "include",
      });

      if (!jsonResponse.ok) {
        let errorText = "";
        try {
          // Try to get the error details
          errorText = await jsonResponse.text();
        } catch (e) {
          errorText = "Could not extract error details";
        }

        console.error("All submission attempts failed");
        console.error(
          `JSON attempt error: ${jsonResponse.status} ${jsonResponse.statusText}`
        );
        console.error(`Error details: ${errorText}`);
        throw new Error(`Failed to submit form: ${jsonResponse.statusText}`);
      }

      const data = await jsonResponse.json();
      console.log("Form submission response (JSON method):", data);
      return data as WPCF7SubmissionResponse;
    }

    // Process the original FormData response
    let responseText = "";
    try {
      responseText = await response.text();
      console.log("Raw response text:", responseText);

      // Try to parse as JSON
      const data = JSON.parse(responseText);
      console.log("Form submission response:", data);
      return data as WPCF7SubmissionResponse;
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      console.error("Raw response was:", responseText);

      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Error in submitContactForm:", error);

    // Create a fallback error response
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    } as WPCF7SubmissionResponse;
  }
}

/**
 * Submits Contact Form 7 data using the simplified TEST endpoint
 */
/**
 * Submits Contact Form 7 data without requiring credentials
 */
export async function submitContactFormSimple(
  formId: string,
  formValues: Record<string, string>
): Promise<WPCF7SubmissionResponse> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://stegetfore.nu/wp-json";
  const endpoint = `${API_URL}/steget/v1/cf7/simple-submit/${formId}`;

  console.log(`Submitting form to endpoint: ${endpoint}`);
  console.log("Form data being submitted:", formValues);

  try {
    // Try the Next.js API route first (avoids CORS)
    const proxyEndpoint = `/api/cf7-proxy?formId=${formId}`;
    console.log(`Trying proxy endpoint: ${proxyEndpoint}`);

    try {
      const proxyResponse = await fetch(proxyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        console.log("Proxy submission successful:", data);
        return data as WPCF7SubmissionResponse;
      } else {
        console.warn("Proxy submission failed, trying direct submission");
      }
    } catch (proxyError) {
      console.warn("Proxy error, falling back to direct method:", proxyError);
    }

    // If proxy fails, try direct submission WITHOUT credentials
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
      mode: "cors",
      // Remove credentials: "include" which was causing the CORS issue
    });

    if (!response.ok) {
      let errorDetails = "";
      try {
        errorDetails = await response.text();
      } catch (e) {
        errorDetails = "Could not extract error details";
      }

      console.error(
        `Error submitting form: ${response.status} ${response.statusText}`
      );
      console.error(`Error details: ${errorDetails}`);
      throw new Error(`Failed to submit form: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Form submission response:", data);
    return data as WPCF7SubmissionResponse;
  } catch (error) {
    console.error("Error in submitContactFormSimple:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    } as WPCF7SubmissionResponse;
  }
}
