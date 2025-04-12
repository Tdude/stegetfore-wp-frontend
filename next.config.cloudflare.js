/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Keep the type error bypass that works well for us
    ignoreBuildErrors: true,
  },
  // Use Cloudflare's module worker environment
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  images: {
    domains: [
      "stegetfore.nu",
      "www.stegetfore.nu", 
      "secure.gravatar.com",
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
        hostname: "**.wp.com",
        pathname: "/**",
      },
    ],
    // Use Cloudflare's image optimization
    loader: 'cloudflare',
    path: '',
  },
  // Keep your existing rewrites and redirects
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
};

module.exports = nextConfig;
