const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ===== Core Config =====
  compress: true,
  productionBrowserSourceMaps: false,

  // ===== TypeScript =====
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Only for temporary use!
  },

  // ===== Image Optimization =====
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stegetfore.nu",
      },
      {
        protocol: "https",
        hostname: "**.stegetfore.nu",
      },
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
    ],
    minimumCacheTTL: 3600, // 1 hour cache
  },

  // ===== Routing =====
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/:path*`,
      },
      {
        source: "/:slug",
        destination: "/posts/:slug",
        has: [
          {
            type: "header",
            key: "x-matched-path",
            value: "(?!/api).*",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/pages/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/page/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },

  // ===== Webpack Overrides =====


  // ===== Next.js 15+ Specific =====
  experimental: {
    optimizeCss: true, // CSS minification (enabled by default in 15+)
  },
};

module.exports = nextConfig;