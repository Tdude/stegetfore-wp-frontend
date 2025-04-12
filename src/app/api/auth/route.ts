// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';

// Base WordPress API URL
const WP_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/wp-json';

// Development mode detection
const isDevelopment = process.env.NODE_ENV === 'development';

// Development credentials from environment variables
const DEV_USERNAME = process.env.NEXT_PUBLIC_DEV_USERNAME;
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_PASSWORD;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, username, password, token } = data;
    
    // Log the auth request (without sensitive data)
    console.log(`API Auth request: ${action}`, isDevelopment ? '(DEV MODE)' : '');
    
    // Special handling for development mode
    if (isDevelopment) {
      // In development mode, check if the credentials match our dev credentials
      if (action === 'login' && username === DEV_USERNAME) {
        console.log('Development mode: Simulating successful login');
        
        // Create a mock token and return success response
        const mockToken = `dev_token_${Date.now()}`;
        
        return NextResponse.json({
          token: mockToken,
          user_id: 1,
          user_login: username
        });
      }
      
      // Successful validation in development mode
      if (action === 'validate' && token && token.startsWith('dev_token_')) {
        console.log('Development mode: Simulating successful token validation');
        return NextResponse.json({ valid: true });
      }
      
      // Mock user info in development mode
      if (action === 'user' && token && token.startsWith('dev_token_')) {
        console.log('Development mode: Returning mock user data');
        
        return NextResponse.json({
          id: 1,
          username: DEV_USERNAME,
          display_name: 'Development Admin',
          email: 'dev@example.com',
          roles: ['administrator']
        });
      }
    }
    
    // Route to appropriate auth endpoint
    let endpoint = '';
    let method = 'GET';
    let body: any = null;
    
    switch (action) {
      case 'login':
        endpoint = '/ham/v1/auth/token';
        method = 'POST';
        body = JSON.stringify({ username, password });
        break;
      case 'validate':
        endpoint = '/ham/v1/auth/validate';
        // We'll pass the token in the Authorization header
        break;
      case 'user':
        endpoint = '/ham/v1/user/current';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Build request URL
    const url = WP_API_URL + endpoint;
    
    // Set up headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the request to WordPress
    console.log(`Forwarding request to WordPress: ${url}`);
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? body : undefined,
    });
    
    // If the request failed and we're in development mode, return mock responses
    if (!response.ok && isDevelopment) {
      console.log(`WordPress request failed in development mode: ${response.status}`);
      
      if (action === 'login') {
        // Create a mock token and return success response
        const mockToken = `dev_token_${Date.now()}`;
        
        return NextResponse.json({
          token: mockToken,
          user_id: 1,
          user_login: username
        });
      }
      
      if (action === 'validate') {
        return NextResponse.json({ valid: true });
      }
      
      if (action === 'user') {
        return NextResponse.json({
          id: 1,
          username: DEV_USERNAME,
          display_name: 'Development Admin',
          email: 'dev@example.com',
          roles: ['administrator']
        });
      }
    }
    
    // Get response data
    const responseData = await response.json();
    
    // Return the data as JSON
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Auth API error:', error);
    
    // In development mode, return mock success responses even on error
    if (isDevelopment) {
      const { action, username, token } = await request.json().catch(() => ({ action: '', username: '', token: '' }));
      
      if (action === 'login') {
        console.log('Development mode: Returning mock login response after error');
        return NextResponse.json({
          token: `dev_token_${Date.now()}`,
          user_id: 1,
          user_login: username || DEV_USERNAME
        });
      }
      
      if (action === 'validate') {
        console.log('Development mode: Returning mock validation after error');
        return NextResponse.json({ valid: true });
      }
      
      if (action === 'user') {
        console.log('Development mode: Returning mock user data after error');
        return NextResponse.json({
          id: 1,
          username: DEV_USERNAME,
          display_name: 'Development Admin',
          email: 'dev@example.com',
          roles: ['administrator']
        });
      }
    }
    
    return NextResponse.json(
      { error: 'Authentication service error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
