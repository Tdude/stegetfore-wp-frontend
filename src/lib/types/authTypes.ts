// src/lib/types/authTypes.ts

/**
 * User information returned from the authentication API
 */
export interface UserInfo {
  id?: number;           // WordPress user ID
  student_id?: number;   // Student ID from the HAM system
  name?: string;         // Full name
  email?: string;        // Email address
  roles?: string[];      // User roles
  avatar?: string;       // Avatar URL
  meta?: Record<string, any>; // Additional user meta
}

/**
 * Authentication response containing token and user info
 */
export interface AuthResponse {
  token?: string;
  user?: UserInfo;
  success?: boolean;
  message?: string;
}
