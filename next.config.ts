import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isStaticExport = process.env.NEXT_OUTPUT_MODE === "export";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  images: {
    unoptimized: isStaticExport,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx"].filter(Boolean),
  turbopack: {
    root: projectRoot,
    rules: {
      "**/@eaDir/**": {
        loaders: [],
        as: "*.ignore",
      },
    },
  },
};

export default nextConfig;
