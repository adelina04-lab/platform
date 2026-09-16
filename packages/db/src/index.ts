import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

/**
 * Единственный экземпляр клиента базы на процесс.
 *
 * В режиме разработки Next пересоздаёт модули при горячей перезагрузке, поэтому
 * клиент кладётся на globalThis: иначе каждое изменение файла открывает новый
 * пул соединений, и Postgres быстро упирается в лимит.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Не задана переменная окружения DATABASE_URL — скопируйте .env.example в .env",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "./generated/prisma/client";
