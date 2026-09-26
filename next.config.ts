import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js "N" indicator so it doesn't sit on the design preview.
  // Compile/runtime error overlays still appear.
  devIndicators: false,
  // §5.4 — iconsax-react is large; tree-shake named imports only.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
