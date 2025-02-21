import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["shared"],
};

export default nextConfig;
