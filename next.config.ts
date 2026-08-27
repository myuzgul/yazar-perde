import type { NextConfig } from "next";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  },
};

export default nextConfig;