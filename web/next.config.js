/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors will not fail the production build.
    // Run `npm run lint` separately to review warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Likewise, don't fail builds on TS errors during active development
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
