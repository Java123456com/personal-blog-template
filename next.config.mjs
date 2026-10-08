/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  // In export mode Next.js uses distDir for the published static files.
  distDir: process.env.NODE_ENV === "production" ? "out" : ".next-static-dev",
};

export default nextConfig;
