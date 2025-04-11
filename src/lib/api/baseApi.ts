// src/lib/api/baseApi.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
export const THEME_SLUG = process.env.NEXT_PUBLIC_THEME_SLUG || "steget";

if (!API_URL) {
  console.warn("API_URL is not defined, API calls may fail");
}

/**
 * Shared function to make API calls to the WordPress backend
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
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  try {
    // Determine if we should stringify the body based on content type
    const contentType = options.headers?.['Content-Type'] || options.headers?.['content-type'] || 'application/json';
    let processedBody = options.body;
    
    // Only stringify if it's JSON content type and the body isn't already a string
    if (contentType.includes('application/json') && options.body && typeof options.body !== 'string') {
      processedBody = JSON.stringify(options.body);
    }
    
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": contentType,
        ...(options.headers || {})
      },
      body: processedBody,
      // Disable cache for all requests
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response carefully to preserve all fields
    const text = await response.text();
    
    try {
      // Parse JSON while preserving all fields
      const data = JSON.parse(text);
      return data;
    } catch (jsonError: any) {
      console.error(`JSON parse error for ${url}:`, jsonError);
      throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
    }
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
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
