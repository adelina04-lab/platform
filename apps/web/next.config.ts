import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack сам транспилирует пакеты рабочей области монорепозитория,
  // поэтому @platform/core перечислять в transpilePackages не нужно.

  // Исходники лежат на хосте под Windows и приезжают в контейнер бинд-монтом,
  // а события файловой системы через такой монт не долетают — без опроса Fast
  // Refresh не срабатывает вообще. Документация Next называет опрос крайней
  // мерой из-за нагрузки на процессор, но для разработки в Docker на Windows
  // альтернатив нет. На сборку и на продакшн не влияет.
  watchOptions: {
    pollIntervalMs: 800,
  },
};

export default nextConfig;
