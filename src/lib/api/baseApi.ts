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
export async function fetchApi(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const url = API_URL + (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
  
  // Prepare the body if it's a JSON request
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }
  
  console.log(`API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body,
    });

    if (!response.ok) {
      console.warn(`API error: ${response.status} ${response.statusText} for ${url}`);
      return { 
        error: true, 
        status: response.status,
        message: response.statusText
      };
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {};
    }

    // Parse JSON response
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('Failed to parse JSON response');
      return { content: text };
    }
  } catch (error) {
    console.error(`Network error calling ${url}:`, error);
    return { 
      error: true, 
      network: true,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
