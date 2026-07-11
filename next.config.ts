import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The entire company runs as static files: the marketing site and the
  // product are exported HTML+JS. No server, no APIs, no keys — the product's
  // core promise ("your books never leave your browser") is enforced by
  // architecture, not policy.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
