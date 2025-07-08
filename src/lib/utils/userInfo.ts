// Utility functions for handling user info in localStorage

import type { JwtUserInfo } from '@/lib/api/formTryggveApi';
import type { UserInfo } from '@/contexts/AuthContext';

export const USER_INFO_KEY = 'user_info';

export function setUserInfo(user: unknown) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

export function getUserInfo<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_INFO_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

export function jwtToUserInfo(jwt: JwtUserInfo): UserInfo {
  // Debug: log the complete JWT payload
  console.log('JWT payload received:', jwt);
  
  // First extract all available properties from JWT
  const { user_id, display_name, user_display_name, user_email, user_login, roles, ...rest } = jwt;
  
  console.log('JWT display_name:', display_name);
  console.log('JWT user_display_name:', user_display_name);
  console.log('JWT user_login:', user_login);
  console.log('JWT user_email:', user_email);
  
  // Return object with JWT data as primary source and only use fallbacks when needed
  const result = {
    ...rest, // Include any other properties from JWT
    id: user_id,
    username: user_login || 'dev', // Use user_login from JWT, fallback to dev
    display_name: display_name || user_display_name || 'Dev User', // Try both JWT display name fields, fallback to dev
    email: user_email || 'dev@example.com', // Use JWT email, fallback to dev
    roles: Array.isArray(roles) ? roles : ['administrator'], // Use JWT roles if array, fallback to admin
  };
  
  // Debug: log the final user info object
  console.log('Final userInfo object:', result);
  
  return result;
}
