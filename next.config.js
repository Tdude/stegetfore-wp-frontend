/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["stegetfore.nu"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
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
