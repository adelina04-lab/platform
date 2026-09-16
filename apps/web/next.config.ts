import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack сам транспилирует пакеты рабочей области монорепозитория,
  // поэтому @platform/core перечислять в transpilePackages не нужно.
};

export default nextConfig;
