# platform

Сервис калькуляторов отпуска: считает полную стоимость поездки — перелёт,
проживание, питание вне отеля, трансфер, страховку, экскурсии и визу — и ведёт
человека к бронированию по партнёрским ссылкам.

Дорожная карта разработки: [эпики, фазы и ворота](https://claude.ai/artifact/BQEFNigERaWVEktU25V7xy).
Текущий этап — **эпик E1, каркас**.

Вся разработка идёт в Docker: на хост ставить Node, Postgres и Redis не нужно.

---

## Разворачивание с нуля

### 1. Что нужно заранее

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS)
  или Docker Engine + Compose plugin (Linux);
- Git.

### 2. Клонировать и завести `.env`

```bash
git clone https://github.com/adelina04-lab/platform.git
cd platform
cp .env.example .env
```

Значения по умолчанию совпадают с `docker-compose.yml`, поэтому для первого
запуска править `.env` не нужно. Токены партнёрских программ (`TRAVELPAYOUTS_*`
и остальные) можно оставить пустыми: приложение поднимется, а сборщики цен
сообщат, какой переменной им не хватает.

### 3. Поднять контейнеры

```bash
docker compose up -d --build
```

| Сервис | Что делает | Порт на хосте |
|---|---|---|
| `app` | Next.js в режиме разработки | 3000 |
| `postgres` | база с ценами | 5432 |
| `redis` | очереди BullMQ для сборщиков цен | 6379 |

### 4. Применить миграции

```bash
docker compose exec app npm run db:migrate
```

Сайт откроется на http://localhost:3000.

---

## Структура

```
apps/
  web/            Сайт: калькулятор и SEO-страницы направлений
packages/
  core/           Движок расчёта — чистый TypeScript, без React и без базы
  db/             Prisma: схема цен и клиент
docker/
  app.Dockerfile  Образ приложения: dev, builder и runner
```

**Главное архитектурное правило:** вся математика расчёта живёт в
`packages/core` и ничего не знает о вебе. Сайт, будущий Telegram-бот,
встраиваемый виджет и мобильное приложение — тонкие клиенты одного движка.
Логика расчёта не дублируется ни при каких обстоятельствах.

Деньги везде хранятся и считаются в копейках (`valueMinor`), никогда во float.

Таблица `price_points` пополняется, а не перезаписывается: каждое наблюдение
цены ложится новой строкой с датой сбора. Через год это даёт историю цен,
которую невозможно получить задним числом.

---

## Команды

Все команды запускаются внутри контейнера: `docker compose exec app <команда>`.

| Команда | Что делает |
|---|---|
| `npm run dev` | дев-сервер (запускается сам при `docker compose up`) |
| `npm run build` | продакшн-сборка всех пакетов |
| `npm run typecheck` | проверка типов во всех пакетах |
| `npm run lint` | ESLint |
| `npm run test` | тесты движка расчёта |
| `npm run db:migrate` | создать и применить миграцию |
| `npm run db:generate` | перегенерировать клиент Prisma после правки схемы |
| `npm run db:studio` | Prisma Studio для просмотра данных |

---

## Переменные окружения

| Переменная | Обязательна | Назначение |
|---|---|---|
| `DATABASE_URL` | да | подключение к Postgres |
| `REDIS_URL` | да | очереди сборщиков цен |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | да | учётные данные контейнера базы |
| `NEXT_PUBLIC_SITE_URL` | да | канонические адреса и OG-разметка |
| `TRAVELPAYOUTS_TOKEN` | для E3 | Flight Data API: цены на перелёт |
| `TRAVELPAYOUTS_MARKER` | для E9 | метка партнёра в ссылках |
| `LEVELTRAVEL_TOKEN` | для E4 | цены пакетных туров |
| `CHEREHAPA_TOKEN` | для E4 | цены страховок |
| `KIWITAXI_TOKEN` | для E4 | цены трансферов |
| `YANDEX_METRIKA_ID` | для E11 | аналитика |

---

## Стек

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind 4,
PostgreSQL 17 + Prisma 7, Redis + BullMQ, npm workspaces + Turborepo.

Документация Next лежит в самом пакете — `node_modules/next/dist/docs/`.
Она соответствует установленной версии, и читать нужно именно её: в 16-й версии
многое изменилось по сравнению с тем, что помнят языковые модели и старые
статьи. То же касается Prisma 7: адрес базы теперь задаётся в
`packages/db/prisma.config.ts`, а не в `schema.prisma`.
