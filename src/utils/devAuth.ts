/**
 * Developer authentication helper
 * Provides easy access to development credentials from .env.local
 */

// Credentials from environment variables only
const devCredentials = {
  username: process.env.NEXT_PUBLIC_DEV_USERNAME,
  password: process.env.NEXT_PUBLIC_DEV_PASSWORD,
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get development credentials for quick login
 * Only works in development environment
 */
export const getDevCredentials = () => {
  if (!isDevelopment) {
    console.warn('Dev credentials are only available in development environment');
    return null;
  }

  if (!devCredentials.username || !devCredentials.password) {
    console.warn('Missing development credentials in .env.local file');
    return null;
  }

  console.log('Development credentials ready for user:', devCredentials.username);
  
  return {
    username: devCredentials.username,
    password: devCredentials.password
  };
};

/**
 * Quick login function for development
 * @param loginFunction The login function from auth context
 */
export const quickDevLogin = async (loginFunction: (username: string, password: string) => Promise<unknown>) => {
  if (!isDevelopment) {
    console.warn('Quick login is only available in development environment');
    return { success: false };
  }

  const credentials = getDevCredentials();
  if (!credentials) {
    return { success: false };
  }

  console.log(`Using development credentials for quick login with username: ${credentials.username}`);
  
  try {
    return await loginFunction(credentials.username, credentials.password);
  } catch (error) {
    console.error('Dev login error:', error);
    return { success: false, error };
  }
};
