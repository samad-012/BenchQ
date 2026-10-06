import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js "N" indicator so it doesn't sit on the design preview.
  // Compile/runtime error overlays still appear.
  devIndicators: false,
  // §5.4 — iconsax-react is large; tree-shake named imports only.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Proxy the FastAPI backend so browser requests stay same-origin (no CORS,
  // and the backend's HTTP-only session cookie is sent automatically).
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/health", destination: `${backend}/health` },
    ];
  },
};

export default nextConfig;
