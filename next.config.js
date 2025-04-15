/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if this project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "stegetfore.nu",
      "www.stegetfore.nu",
      "secure.gravatar.com", // For WordPress avatars
      "localhost",
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
        permanent: true, // 308 redirect
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;
