/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // No basePath or output: 'export' needed for Vercel
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
