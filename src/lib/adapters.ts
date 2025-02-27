// src/lib/adapters.ts
import { Post, Page, LocalPage, HomepageData, SiteInfo } from "./types";

import {
  WordPressPost,
  WordPressPage,
  WordPressHomepageData,
  WordPressSiteInfo,
} from "./types-wordpress";

/**
 * Adapts WordPress post data to the application Post format
 */
export function adaptWordPressPost(wpPost: WordPressPost): Post {
  return {
    id: wpPost.id,
    slug: wpPost.slug,
    title: {
      rendered: wpPost.title?.rendered || "",
    },
    excerpt: {
      rendered: wpPost.excerpt?.rendered || "",
    },
    content: {
      rendered: wpPost.content?.rendered || "",
    },
    featured_image_url:
      wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    categories: wpPost.categories || [],
  };
}

/**
 * Adapts WordPress page data to the application Page format
 */
export function adaptWordPressPage(wpPage: WordPressPage): Page {
  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    excerpt: {
      rendered: wpPage.excerpt?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    featured_image_url:
      wpPage._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    template: wpPage.template || "",
    chartData: wpPage.chartData || null,
  };
}

/**
 * Adapts WordPress page data to the application LocalPage format
 */
export function adaptWordPressPageToLocalPage(
  wpPage: WordPressPage
): LocalPage {
  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    excerpt: {
      rendered: wpPage.excerpt?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    featured_image_url:
      wpPage._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    template: wpPage.template || "",
    chartData: wpPage.chartData || null,
  };
}

/**
 * Adapts WordPress homepage data to the application HomepageData format
 */
export function adaptWordPressHomepageData(
  wpHomepageData: WordPressHomepageData,
  posts: Post[] = []
): HomepageData {
  return {
    ...wpHomepageData,
    featured_posts: posts,
    // Ensure other properties are safely mapped
    selling_points: wpHomepageData.selling_points?.map((point) => ({
      id: point.id,
      title: point.title,
      content: point.content,
      icon: point.icon,
    })),
    stats: wpHomepageData.stats?.map((stat) => ({
      id: stat.id,
      value: stat.value,
      label: stat.label,
    })),
    gallery: wpHomepageData.gallery?.map((item) => ({
      id: item.id,
      image: item.image,
      title: item.title,
      description: item.description,
    })),
    testimonials: wpHomepageData.testimonials?.map((testimonial) => ({
      id: testimonial.id,
      content: testimonial.content,
      author_name: testimonial.author_name,
      author_position: testimonial.author_position,
      author_image: testimonial.author_image,
    })),
  };
}

/**
 * Adapts WordPress site info data to the application SiteInfo format
 */
export function adaptWordPressSiteInfo(
  wpSiteInfo: WordPressSiteInfo
): SiteInfo {
  return {
    name: wpSiteInfo.name || "Site Name",
    description: wpSiteInfo.description || "Site Description",
    url: wpSiteInfo.url,
    admin_email: wpSiteInfo.admin_email,
    language: wpSiteInfo.language,
  };
}
