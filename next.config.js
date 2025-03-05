/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "stegetfore.nu",
      "www.stegetfore.nu",
      "secure.gravatar.com", // For WordPress avatars
      "localhost", // For local development
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.stegetfore.nu",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.wp.com", // For WordPress.com hosted images
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/:path*`,
      },
      // Handle posts URLs internally without redirecting
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
        permanent: true, // 308 redirect
      },
      {
        source: "/page/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
