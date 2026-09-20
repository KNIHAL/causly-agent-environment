import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      { source: "/docs", destination: "/docs/index.html" },
      {
        source: "/docs/:path((?!.*\\.[a-zA-Z0-9]+$).*)",
        destination: "/docs/:path/index.html",
      },
    ];
  },
};

export default nextConfig;
