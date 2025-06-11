// Utility to determine if Authorization header should be sent

/**
 * Returns true if the Authorization header should be sent.
 * - Only send if token is present
 * - Do NOT send if token is a dev placeholder (starts with 'dev_token_')
 */
export function shouldSendAuthHeader(token?: string): boolean {
  if (!token) return false;
  // Do not send if it's a placeholder dev token.
  // Real tokens (even in dev) should be sent if present.
  if (token.startsWith('dev_token_')) return false;
  // Removed: if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return false;
  return true;
}
