import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint errors will not fail the production build.
    // Run `npm run lint` separately to review warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Likewise, don't fail builds on TS errors during active development
    ignoreBuildErrors: true,
  },
  // Pin Turbopack root to this web/ folder so it ignores the parent lockfile
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
