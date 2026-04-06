import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage signed URLs are served from the project's storage domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
};

export default nextConfig;
