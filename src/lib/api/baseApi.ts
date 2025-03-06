// src/lib/api/baseApi.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
export const THEME_SLUG = process.env.NEXT_PUBLIC_THEME_SLUG || "steget";

if (!API_URL) {
  console.warn("API_URL is not defined, API calls may fail");
}

/**
 * Core function for making API requests to WordPress
 * @param endpoint The API endpoint path (without the base URL)
 * @param options Additional fetch options including revalidation time
 * @returns The JSON response from the API
 */
export async function fetchApi(
  endpoint: string,
  options: {
    revalidate?: number;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const url = `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Log in development only
  if (process.env.NODE_ENV === "development") {
    console.log(`Fetching: ${url}`);
  }

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
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
    return handleApiError(error, endpoint);
  }
}

/**
 * Standardized error handling for API requests
 * @param error The error object from the catch block
 * @param endpoint The endpoint that was being accessed
 * @returns Never returns - always throws an error
 */
export function handleApiError(error: any, endpoint: string): never {
  console.error(`Error fetching ${endpoint}:`, error);

  // Enhance the error with additional context
  const enhancedError = new Error(
    `API request failed: ${endpoint}\n${error.message || "Unknown error"}`
  );

  // Preserve the original stack trace if possible
  if (error.stack) {
    enhancedError.stack = error.stack;
  }

  throw enhancedError;
}

/**
 * Simple connection test function
 */
export async function testConnection() {
  try {
    return await fetchApi(`/${THEME_SLUG}/v1/test`);
  } catch (error) {
    console.error("API Connection Error:", error);
    throw error;
  }
}
