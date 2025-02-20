// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function testConnection() {
  try {
    const res = await fetch(`${API_URL}/stegetfore-headless-wp/v1/test`);
    if (!res.ok) throw new Error("API response was not ok");
    return await res.json();
  } catch (error) {
    console.error("API Connection Error:", error);
    throw error;
  }
}

export async function fetchPosts() {
  try {
    const res = await fetch(`${API_URL}/wp/v2/posts?_embed`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return await res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function fetchPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/wp/v2/posts?slug=${slug}&_embed`);
    if (!res.ok) throw new Error("Failed to fetch post");
    const posts = await res.json();
    return posts[0];
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

export async function fetchSiteInfo() {
  try {
    const res = await fetch(`${API_URL}/stegetfore-headless-wp/v1/site-info`);
    if (!res.ok) throw new Error("Failed to fetch site info");
    return await res.json();
  } catch (error) {
    console.error("Error fetching site info:", error);
    throw error;
  }
}
