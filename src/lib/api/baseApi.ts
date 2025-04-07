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
 * @returns The JSON response of type T
 */
export async function fetchApi<T>(
  endpoint: string,
  options: {
    revalidate?: number;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    // Determine if we should stringify the body based on content type
    const contentType = options.headers?.["Content-Type"] || "application/json";
    let body = options.body;

    // Only stringify JSON bodies, leave others as is
    if (options.body && contentType === "application/json") {
      body = JSON.stringify(options.body);
    }

    // Set default Content-Type if not specified in headers
    const headers = {
      "Content-Type": contentType,
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: body,
      // Default to 60 seconds if not specified
      next: { revalidate: options.revalidate ?? 60 },
    });

    if (!response.ok) {
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };

      console.error("API Error:", errorInfo);

      // Try to get more detailed error information from the response if possible
      try {
        const errorData = await response.json();
        throw new Error(
          `API error (${response.status}): ${errorData.message || response.statusText}`
        );
      } catch (jsonError) {
        // If we can't parse the JSON, just throw with the status info
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
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
