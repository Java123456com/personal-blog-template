import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Keep production builds away from the active development cache. This
  // prevents `next build` from invalidating CSS and Three.js dev chunks.
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
};

export default nextConfig;
