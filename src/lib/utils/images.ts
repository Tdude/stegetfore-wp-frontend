/**
 * Transforms image URLs to always use the production URL in development
 * This ensures consistent image loading without needing local copies
 */
export function getImageUrl(path: string): string {
  if (!path) return '';

  // Define production and development domains
  const devDomains = ['localhost:8000', '127.0.0.1:8000'];
  const prodDomain = 'https://stegetfore.nu';

  // Check if the path is a dev URL
  const isDevUrl = devDomains.some(domain => path.includes(domain));
  
  if (isDevUrl) {
    // Replace development domain with production
    return devDomains.reduce(
      (url, domain) => url.replace(`http://${domain}`, prodDomain),
      path
    );
  }

  // If it's a relative path, prepend the production domain
  if (path.startsWith('/')) {
    return `${prodDomain}${path}`;
  }

  return path;
}
