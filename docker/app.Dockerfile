# syntax=docker/dockerfile:1

# Debian-slim, а не alpine: на alpine движку миграций Prisma нужен отдельный
# набор пакетов, а здесь хватает openssl.
FROM node:24-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Если TLS-трафик перехватывает антивирус или корпоративный прокси, его
# корневой сертификат кладётся в docker/certs/*.crt — иначе npm внутри
# контейнера видит self-signed certificate. Обычно папка пуста, и шаг ничего
# не делает. Подробности — в docker/certs/README.md.
COPY docker/certs/ /tmp/extra-certs/
RUN find /tmp/extra-certs -name '*.crt' -exec cp {} /usr/local/share/ca-certificates/ \; \
  && update-ca-certificates \
  && rm -rf /tmp/extra-certs
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

# --------------------------------------------------------------------------
# Зависимости. Копируем только манифесты, чтобы слой переиспользовался,
# пока не менялись package.json.
# --------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
RUN npm ci

# --------------------------------------------------------------------------
# Разработка. Исходники приезжают бинд-монтом из docker-compose, node_modules
# остаётся из образа (анонимный том поверх точки монтирования). Клиент Prisma
# генерируется на старте: схема приезжает с хоста и может быть свежее образа.
# --------------------------------------------------------------------------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npm run db:generate && npm run dev"]

# --------------------------------------------------------------------------
# Сборка продакшн-образа.
# --------------------------------------------------------------------------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate && npm run build

# --------------------------------------------------------------------------
# Продакшн.
# --------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app ./
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@platform/web"]
