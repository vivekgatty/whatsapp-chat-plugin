import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack root to this web/ folder so it ignores the parent lockfile
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
