import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ini akan mengabaikan error tipe data (TS) saat proses build di Vercel
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.ts",
    },
  },
};

export default nextConfig;