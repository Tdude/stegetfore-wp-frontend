// src/app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API requests to WordPress API
 * This allows client components to fetch WordPress data without CORS issues
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing endpoint parameter' },
      { status: 400 }
    );
  }

  // Construct the full WordPress API URL
  const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:8000';
  const url = `${wpBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, { 
      next: { revalidate: 60 }, // Revalidate every minute
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `WordPress API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from WordPress API' },
      { status: 500 }
    );
  }
}
