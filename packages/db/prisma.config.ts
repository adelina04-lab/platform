import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 больше не подхватывает .env сам, а файл лежит в корне монорепозитория.
const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../../.env") });

// В Prisma 7 адрес базы задаётся здесь, а не в schema.prisma. Без переменной
// окружения `prisma generate` всё равно работает (нужно при сборке образа),
// а `prisma migrate` честно сообщит, что источник данных не настроен.
const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(url ? { datasource: { url } } : {}),
});
