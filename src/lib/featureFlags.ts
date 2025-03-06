// src/lib/featureFlags.ts

/**
 * Feature flags to control the rollout of new functionality
 * Set these via environment variables in the .env file
 */
export const FEATURES = {
  USE_NEW_API: process.env.NEXT_PUBLIC_USE_NEW_API === "true" || false,
  USE_MODULAR_TEMPLATES:
    process.env.NEXT_PUBLIC_USE_MODULAR_TEMPLATES === "true" || true, // Default to true for development
};
