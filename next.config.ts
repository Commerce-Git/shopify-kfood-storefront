import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "feezosccyvecmrhqrkgl.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
