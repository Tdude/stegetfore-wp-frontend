// src/lib/imageUtils.ts
import { ImageContainer } from '@/lib/types/baseTypes';

/**
 * Cleans HTML content from a string
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Determines if an image URL is from an external source
 */
export function isExternalImage(url: string): boolean {
  if (!url) return false;

  // Check for allowed domains
  const allowedDomains = [
    "stegetfore.nu",
    "www.stegetfore.nu",
    "secure.gravatar.com",
    "stegetfore.netlify.app",
  ];

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check if hostname is in our allowed domains
    return !allowedDomains.some((domain) => hostname.includes(domain));
  } catch {
    // If URL parsing fails, assume it's a relative path and therefore internal
    return false;
  }
}

/**
 * Gets appropriate sizes value based on container size and screen breakpoints
 */
export function getImageSizes(containerType: ImageContainer): string {
  switch (containerType) {
    case "hero":
      return "100vw"; // Hero images are full width

    case "featured":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

    case "card":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

    case "gallery":
      return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";

    default:
      return "(max-width: 768px) 100vw, (max-width: 1280px) 800px, 800px";
  }
}

/**
 * Extracts image dimensions from WP media object if available
 */
export function getImageDimensions(media: unknown): {
  width: number;
  height: number;
} {
  if (
    typeof media === 'object' &&
    media !== null &&
    'media_details' in media &&
    typeof (media as { media_details?: unknown }).media_details === 'object' &&
    (media as { media_details?: unknown }).media_details !== null &&
    typeof (media as { media_details: { width?: unknown } }).media_details.width === 'number' &&
    typeof (media as { media_details: { height?: unknown } }).media_details.height === 'number'
  ) {
    const details = (media as { media_details: { width: number; height: number } }).media_details;
    return {
      width: details.width,
      height: details.height,
    };
  }

  // Default dimensions if not available
  return {
    width: 1200,
    height: 630,
  };
}

/**
 * Gets the appropriate image size from WordPress media based on container
 */
export function getOptimalImageSize(
  media: unknown,
  containerType: "thumbnail" | "medium" | "large" | "full" = "full"
): string {
  if (
    typeof media !== 'object' ||
    media === null ||
    !('media_details' in media) ||
    typeof (media as { media_details?: unknown }).media_details !== 'object' ||
    (media as { media_details?: unknown }).media_details === null ||
    !('sizes' in (media as { media_details: { sizes?: unknown } }).media_details)
  ) {
    return (media && typeof media === 'object' && 'source_url' in media && typeof (media as { source_url?: unknown }).source_url === 'string')
      ? (media as { source_url: string }).source_url
      : "";
  }

  const sizes = (media as { media_details: { sizes: Record<string, { source_url: string }> } }).media_details.sizes;
  const source_url = (media as { source_url?: unknown }).source_url as string | undefined;

  switch (containerType) {
    case "thumbnail":
      return sizes.thumbnail?.source_url || source_url || "";
    case "medium":
      return sizes.medium?.source_url || source_url || "";
    case "large":
      return sizes.large?.source_url || source_url || "";
    case "full":
    default:
      return source_url || "";
  }
}

/**
 * Get featured image URL from a WordPress post or page
 */
export function getFeaturedImageUrl(content: unknown): string | null {
  if (!content || typeof content !== 'object' || content === null) return null;

  // Direct featured_image_url property
  if ('featured_image_url' in content && typeof (content as { featured_image_url?: unknown }).featured_image_url === 'string') {
    return (content as { featured_image_url: string }).featured_image_url;
  }

  // Check in _embedded data (typical WP REST API response)
  if (
    '_embedded' in content &&
    (content as { _embedded?: unknown })._embedded &&
    typeof (content as { _embedded?: unknown })._embedded === 'object' &&
    'wp:featuredmedia' in (content as { _embedded: { [key: string]: unknown } })._embedded &&
    Array.isArray((content as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"]) &&
    (content as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"].length > 0 &&
    typeof ((content as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"][0] as { source_url?: unknown }).source_url === 'string'
  ) {
    return ((content as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"][0] as { source_url: string }).source_url;
  }

  // Not found
  return null;
}

/**
 * Parse the hero image URL from homepage data
 */
export function getHeroImageUrl(homepageData: unknown): string {
  if (
    typeof homepageData !== 'object' ||
    homepageData === null ||
    !('hero' in homepageData) ||
    !(homepageData as { hero?: unknown }).hero
  ) {
    return "/images/hero-fallback.jpg";
  }

  const hero = (homepageData as { hero?: unknown }).hero;
  const image = (hero as { image?: unknown }).image;

  if (typeof image === "string") {
    return image;
  } else if (Array.isArray(image) && image.length > 0 && typeof image[0] === 'string') {
    return image[0];
  }

  return "/images/hero-fallback.jpg";
}

/**
 * Get appropriate alt text from a media object
 */
export function getImageAlt(media: unknown, fallback: string = "Image"): string {
  if (!media || typeof media !== 'object' || media === null) return fallback;

  // Check for alt_text in the media object
  if ('alt_text' in media && typeof (media as { alt_text?: unknown }).alt_text === 'string') {
    return (media as { alt_text: string }).alt_text;
  }

  // Check for alt_text in _embedded["wp:featuredmedia"][0]
  if (
    '_embedded' in media &&
    (media as { _embedded?: unknown })._embedded &&
    typeof (media as { _embedded?: unknown })._embedded === 'object' &&
    'wp:featuredmedia' in (media as { _embedded: { [key: string]: unknown } })._embedded &&
    Array.isArray((media as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"]) &&
    (media as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"].length > 0 &&
    typeof ((media as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"][0] as { alt_text?: unknown }).alt_text === 'string'
  ) {
    return ((media as { _embedded: { [key: string]: unknown[] } })._embedded["wp:featuredmedia"][0] as { alt_text: string }).alt_text;
  }

  return fallback;
}
