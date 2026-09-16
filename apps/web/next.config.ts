import type { NextConfig } from "next";

// Хостинг SpaceWeb — обычный shared-хостинг: там есть только Apache и нет
// Node, поэтому сайт выкладывается статическим экспортом. Переменная включает
// режим только для сборки под выкладку — в разработке и в Docker всё
// остаётся обычным дев-сервером.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Turbopack сам транспилирует пакеты рабочей области монорепозитория,
  // поэтому @platform/core перечислять в transpilePackages не нужно.
  ...(staticExport
    ? {
        output: "export" as const,
        // Апач отдаёт каталог как index.html, поэтому адреса со слешем на
        // конце — единственный вариант, который работает без правил rewrite.
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
