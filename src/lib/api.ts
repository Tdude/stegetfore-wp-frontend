// src/lib/api.ts
import { MenuItem, SiteInfo } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const THEME_SLUG = process.env.NEXT_PUBLIC_THEME_SLUG;

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

export async function fetchPosts() {
  try {
    // Cache posts list for 20 minutes
    const data = await fetchAPI("/wp/v2/posts?_embed", { revalidate: 1200 });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function fetchPost(slug: string) {
  try {
    // Cache individual posts for 20 minutes
    const data = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed`, {
      revalidate: 1200,
    });
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// Different cache times for different types of content
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

export async function fetchPages() {
  try {
    // Cache pages list for 20 minutes
    const data = await fetchAPI("/wp/v2/pages?_embed", { revalidate: 1200 });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

export async function fetchPage(slug: string) {
  try {
    // Cache individual pages for 20 minutes
    const data = await fetchAPI(`/wp/v2/pages?slug=${slug}&_embed`, {
      revalidate: 1200,
    });
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}
