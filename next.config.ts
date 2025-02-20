// next.config.ts
import { NextConfig } from "next";

const config: NextConfig = {
  images: {
    domains: ["stegetfore.nu"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/:path*`,
      },
    ];
  },
};

export default config;
