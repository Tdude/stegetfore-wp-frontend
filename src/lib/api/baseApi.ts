// src/lib/api/baseApi.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/wp-json';
export const THEME_SLUG = process.env.NEXT_PUBLIC_THEME_SLUG || "steget";

/**
 * Test API connection to the WordPress backend
 * @returns Promise that resolves to true if connected, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/wp/v2/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

/**
 * Shared function to make API calls to the WordPress backend
 * @param endpoint The API endpoint path (without the base URL)
 * @param options Additional fetch options
 * @returns The JSON response from the API
 */
export async function makeRequest(
  endpoint: string,
  options: {
    method?: string;
    body?: string | Record<string, unknown>; // Allow string or object for body
    headers?: Record<string, string>;
    revalidate?: number; // Add revalidate option for Next.js cache control
  } = {}
) {
  const { method = "GET", body, headers = {}, revalidate } = options;

  // Set up the headers with defaults
  const requestHeaders = {
    ...headers,
  };

  // Handle Content-Type header for JSON bodies
  if (body && typeof body === 'object') {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Make the request
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: typeof body === 'object' ? JSON.stringify(body) : body, // Stringify only if object
    });

    // Try to parse the response as JSON
    try {
      const data = await response.json();
      return {
        success: response.ok,
        data,
        status: response.status,
      };
    } catch (error) {
      // If we can't parse as JSON, return the raw response
      return {
        success: response.ok,
        data: null,
        status: response.status,
      };
    }
  } catch (error) {
    console.error("API request failed:", error);
    // Return a standardized error response
    return {
      success: false,
      data: null,
      status: 0,
      error: {
        message: "Failed to fetch data",
      },
    };
  }
}

/**
 * Alias for makeRequest to maintain backward compatibility with existing code
 * that imports fetchApi
 */
export const fetchApi = makeRequest;

/**
 * Transforms an error response into a standardized format
 * @param error Error object from fetch or other source
 * @returns Standardized error object
 */
export function handleApiError(error: unknown): ApiErrorResponse {
  console.error("API Error:", error);
  
  // Return a standardized error response
  return {
    code: "error",
    message: error instanceof Error ? error.message : "An unknown error occurred",
    success: false
  };
}

/**
 * Makes an API request with error handling and response parsing
 * @param url The URL to fetch from
 * @param options Request options
 * @returns Promise with the API response
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    
    // Try to parse as JSON
    let data: T;
    try {
      data = await response.json();
    } catch (error) {
      // If JSON parsing fails, return null data
      console.warn(`Failed to parse JSON from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      data = null as unknown as T;
    }
    
    return {
      data,
      status: response.status,
      // Map headers to a simple object
      headers: Object.fromEntries([...response.headers.entries()]),
    };
  } catch (error) {
    // Handle fetch errors gracefully without exposing the error
    return {
      data: null as unknown as T,
      status: 0,
      headers: {}, // Add empty headers object to satisfy the interface
      error: {
        message: "Failed to fetch data. Please check your connection.",
        code: "network_error"
      }
    };
  }
}

interface ApiErrorResponse {
  code: string;
  message: string;
  success: boolean;
  data?: unknown;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  headers: Record<string, string>;
  error?: {
    message: string;
    code?: string;
  };
}
