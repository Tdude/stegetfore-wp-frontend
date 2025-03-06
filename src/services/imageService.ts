// src/services/imageService.ts
import { ImageContainer } from "@/lib/types";

/**
 * Strips HTML content from a string
 * @param html HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Determines if an image URL is from an external source
 * @param url Image URL
 * @returns Whether the image is external
 */
export function isExternalImage(url: string): boolean {
  if (!url) return false;

  // Check for allowed domains
  const allowedDomains = [
    "stegetfore.nu",
    "www.stegetfore.nu",
    "secure.gravatar.com",
    "localhost",
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
 * @param containerType Container type
 * @returns Sizes attribute for responsive images
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
 * @param media WordPress media object
 * @returns Width and height
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
 * @param media WordPress media object
 * @param size Desired size
 * @returns URL of the image in the requested size
 */
export function getOptimalImageSize(
  media: any,
  size: "thumbnail" | "medium" | "large" | "full" = "full"
): string {
  if (!media || !media.media_details || !media.media_details.sizes) {
    return media?.source_url || "";
  }

  const sizes = media.media_details.sizes;

  switch (size) {
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
 * Gets the featured image URL from a post or page
 * @param content WordPress post or page
 * @returns Featured image URL or null
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
 * Parses the hero image URL from homepage data
 * @param homepageData Homepage data
 * @returns Hero image URL or fallback
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
 * Gets appropriate alt text from a media object
 * @param media WordPress media object
 * @param fallback Fallback alt text
 * @returns Alt text for the image
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

/**
 * Optimizes image loading by calculating aspect ratio and lazyloading
 * @param imageUrl Image URL
 * @param width Image width if known
 * @param height Image height if known
 * @returns Object with optimized image properties
 */
export function optimizeImage(
  imageUrl: string,
  width?: number,
  height?: number
): {
  src: string;
  aspectRatio: number;
  blurDataURL?: string;
  placeholder?: "blur" | "empty";
} {
  // Return default values if no image URL
  if (!imageUrl) {
    return {
      src: "/images/placeholder.jpg",
      aspectRatio: 16 / 9,
    };
  }

  // Calculate aspect ratio
  const aspectRatio = width && height ? width / height : 16 / 9;

  // For external images, no additional optimization
  if (isExternalImage(imageUrl)) {
    return {
      src: imageUrl,
      aspectRatio,
    };
  }

  // For internal images, apply optimization
  return {
    src: imageUrl,
    aspectRatio,
    placeholder: "blur",
    blurDataURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEhAJAJI7tJQAAAABJRU5ErkJggg==",
  };
}
