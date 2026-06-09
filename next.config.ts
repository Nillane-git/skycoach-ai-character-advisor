import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for a slim Docker runtime (no build step in the
  // image, no full node_modules) — see deploy/Dockerfile.
  output: "standalone",
};

export default nextConfig;
