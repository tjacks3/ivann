import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/brand/quick-deal",
        destination: "/brand/campaigns/new",
        permanent: false,
      },
      {
        source: "/brand/quick-deal/tracking",
        destination: "/brand/campaigns",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
