import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prune inactive dev pages from memory after 60s to keep RAM usage lean on 8GB machines
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    // Disable intensive 1.4GB filesystem cache serialization in dev (stops 26.6s full CPU lock & RunCat sprint)
    turbopackFileSystemCacheForDev: false,
  },
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
      {
        protocol: "https",
        hostname: "zijvqethklunvydtqmak.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
  async rewrites() {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://blank-seoul-admin.vercel.app';
    return [
      {
        source: '/api/inquiries/:path*',
        destination: `${adminUrl}/api/inquiries/:path*`,
      },
      {
        source: '/api/inquiries',
        destination: `${adminUrl}/api/inquiries`,
      },
    ];
  },
};

export default nextConfig;
