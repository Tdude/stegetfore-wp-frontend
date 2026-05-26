// src/lib/utils/wpAdmin.ts
// Helpers for linking authenticated editors to the WordPress admin dashboard.

// Last-resort base URL if no environment configuration is present.
const WP_FALLBACK_BASE_URL = 'https://cms.stegetfore.nu';

// WordPress roles allowed to reach the wp-admin dashboard.
const WP_ADMIN_ROLES = ['administrator', 'editor'] as const;

/**
 * Resolve the WordPress admin URL from environment configuration.
 *
 * Preference order:
 *   1. NEXT_PUBLIC_WORDPRESS_URL (the WP site root)
 *   2. NEXT_PUBLIC_API_URL with a trailing `/wp-json` stripped
 *   3. The production CMS fallback
 *
 * @returns Absolute URL to `/wp-admin`, e.g. `https://cms.stegetfore.nu/wp-admin`
 */
export function getWpAdminUrl(): string {
  const apiDerived = process.env.NEXT_PUBLIC_API_URL?.replace(/\/wp-json\/?$/, '');
  const base =
    process.env.NEXT_PUBLIC_WORDPRESS_URL || apiDerived || WP_FALLBACK_BASE_URL;

  return `${base.replace(/\/$/, '')}/wp-admin`;
}

/**
 * Determine whether a user's roles grant access to the WordPress admin.
 *
 * @param roles The role slugs from the authenticated user's info
 * @returns true when the user holds an administrator or editor role
 */
export function canAccessWpAdmin(roles: string[] | undefined | null): boolean {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) =>
    WP_ADMIN_ROLES.includes(role as (typeof WP_ADMIN_ROLES)[number])
  );
}
