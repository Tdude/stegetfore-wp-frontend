// src/lib/imageUtils.ts
import { ImageContainer } from "./types";

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
  } catch (e) {
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
export function getImageDimensions(media: any): {
  width: number;
  height: number;
} {
  if (media?.media_details?.width && media?.media_details?.height) {
    return {
      width: media.media_details.width,
      height: media.media_details.height,
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
  media: any,
  containerType: "thumbnail" | "medium" | "large" | "full" = "full"
): string {
  if (!media || !media.media_details || !media.media_details.sizes) {
    return media?.source_url || "";
  }

  const sizes = media.media_details.sizes;

  switch (containerType) {
    case "thumbnail":
      return sizes.thumbnail?.source_url || media.source_url;

    case "medium":
      return sizes.medium?.source_url || media.source_url;

    case "large":
      return sizes.large?.source_url || media.source_url;

    case "full":
    default:
      return media.source_url;
  }
}

/**
 * Get featured image URL from a WordPress post or page
 */
export function getFeaturedImageUrl(content: any): string | null {
  if (!content) return null;

  // Direct featured_image_url property
  if (content.featured_image_url) return content.featured_image_url;

  // Check in _embedded data (typical WP REST API response)
  if (content._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
    return content._embedded["wp:featuredmedia"][0].source_url;
  }

  // Not found
  return null;
}

/**
 * Parse the hero image URL from homepage data
 */
export function getHeroImageUrl(homepageData: any): string {
  if (!homepageData?.hero) return "/images/hero-fallback.jpg";

  const { image } = homepageData.hero;

  if (typeof image === "string") {
    return image;
  } else if (Array.isArray(image) && image.length > 0) {
    return image[0];
  }

  return "/images/hero-fallback.jpg";
}

/**
 * Get appropriate alt text from a media object
 */
export function getImageAlt(media: any, fallback: string = "Image"): string {
  if (!media) return fallback;

  // Check for alt_text in the media object
  if (media.alt_text) return media.alt_text;

  // Check for alt_text in embedded media
  if (media._embedded?.["wp:featuredmedia"]?.[0]?.alt_text) {
    return media._embedded["wp:featuredmedia"][0].alt_text;
  }

  // Return the fallback
  return fallback;
}
