/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Separate production output from the active development cache.
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
};

export default nextConfig;
