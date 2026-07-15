import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desktop/WorkSpace has other projects with their own lockfiles;
  // pin the root explicitly so Next.js doesn't guess wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
