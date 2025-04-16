// Utility to determine if Authorization header should be sent

/**
 * Returns true if the Authorization header should be sent.
 * - Only send if token is present
 * - Do NOT send if token is a dev placeholder (starts with 'dev_token_')
 * - Do NOT send in development mode (unless explicitly forced)
 */
export function shouldSendAuthHeader(token?: string): boolean {
  if (!token) return false;
  if (token.startsWith('dev_token_')) return false;
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return false;
  return true;
}
