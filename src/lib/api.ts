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

async function fetchAPI(endpoint: string) {
  const url = `${API_URL}/wp-json${endpoint}`;
  console.log("Fetching:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
    const data = await fetchAPI("/wp/v2/posts?_embed");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function fetchPost(slug: string) {
  try {
    const data = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function fetchSiteInfo(): Promise<SiteInfo> {
  try {
    const data = await fetchAPI(`/${THEME_SLUG}/v1/site-info`);
    return {
      name: data.name || "Site Name",
      description: data.description || "Site Description",
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
    const data = await fetchAPI(`/${THEME_SLUG}/v1/menu/primary`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}
