<div align="center">

# Suat's URL Shortener

**A self-hosted URL shortener engineered for speed, durability, and zero-cost negative lookups.**

[![CI](https://github.com/suatsulun/url-shortener/actions/workflows/ci.yml/badge.svg)](https://github.com/suatsulun/url-shortener/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Postgres](https://img.shields.io/badge/Postgres-18-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-8-dc382d?logo=redis&logoColor=white)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

</div>

---

## Table of contents

- [Why this project](#why-this-project)
- [Feature highlights](#feature-highlights)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [How a short URL is born — and how it dies](#how-a-short-url-is-born--and-how-it-dies)
- [Repository layout](#repository-layout)
- [Quick start](#quick-start)
- [Local development without Docker](#local-development-without-docker)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [API reference](#api-reference)
- [Database schema](#database-schema)
- [Production deployment](#production-deployment)
- [Testing & CI](#testing--ci)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why this project

URL shorteners are a deceptively simple "build a CRUD app" exercise — until you actually care about the things production traffic cares about: redirect latency on the hot path, what happens when someone hammers a non-existent short ID, how clicks are counted at scale, and how the system reclaims short IDs over time.

This repo is a full-stack, self-hostable URL shortener that takes those questions seriously. It uses **Redis Cuckoo Filters** to short-circuit 404s before they touch the database, a **pre-generated short ID pool** so URL creation never blocks on `nanoid → uniqueness check → retry` loops, and **BullMQ workers** to flush click counters in batches and reclaim expired IDs. The frontend is a fully-typed React 19 SPA with cookie-based auth, Redux Toolkit Query, and Base UI primitives.

It is built to be read. Every architectural decision below is implemented in the code, not aspirational.

---

## Feature highlights

- **Sub-millisecond 404 path.** Unknown short IDs are rejected by a Cuckoo Filter in Redis without ever hitting Postgres.
- **Pre-generated ID pool.** A background worker keeps 1,000 collision-free short IDs warm in a Redis list — `POST /shorten` just `LPOP`s.
- **Duplicate URL deduplication.** Identical URLs (after normalization + SHA-256 hashing) collapse to one row, with multi-user ownership tracked in a join table.
- **Async click counting.** Redirects increment a Redis hash; a worker flushes counts to Postgres every 60s and slides expiry forward.
- **Sliding 30-day TTL.** URLs expire 30 days after last access. A daily 3 AM cron job batches cleanup, frees IDs back to the pool, and updates the filters.
- **Cookie-based JWT auth.** HTTP-only cookies, CORS with credentials, separate admin key for ops endpoints.
- **Rate limiting.** Global 100 req/min limiter plus a stricter 10 req/15min limiter on auth routes.
- **Structured logging.** Pino with request-scoped child loggers via `pino-http`.
- **Two-stage Docker builds.** Production images run as non-root, with the frontend served by Nginx and same-origin API proxying.
- **Typed end-to-end.** Zod schemas at the API boundary, Drizzle ORM types in the data layer, generated types from the same schemas in the React app.

---

## Tech stack

### Backend
[Express 5](https://expressjs.com/) on **Node 24** + **TypeScript 6** · [Drizzle ORM](https://orm.drizzle.team/) on **Postgres 18** · [Redis 8](https://redis.io/) (Cuckoo Filter, lists, hashes) · [BullMQ](https://docs.bullmq.io/) for scheduled jobs · [Zod](https://zod.dev/) validation · [Pino](https://getpino.io/) logging · `jsonwebtoken` + `bcryptjs` · `express-rate-limit`

### Frontend
[React 19](https://react.dev/) + [Vite 8](https://vite.dev/) + **TypeScript 6** · [React Router 7](https://reactrouter.com/) · [Redux Toolkit](https://redux-toolkit.js.org/) + RTK Query · `redux-persist` for UI state · [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`) · [Base UI](https://base-ui.com/) primitives · `axios` · `lucide-react`

### Infra & tooling
Docker Compose (dev + prod) · multi-stage Dockerfiles · Nginx for static + reverse proxy · GitHub Actions CI · Vitest · ESLint + Prettier · Husky + lint-staged

---

## Architecture

```
                                       ┌────────────────────────┐
                       Browser ───────►│  Nginx (port 8080/80)  │
                                       └────────────┬───────────┘
                                                    │
                       ┌────────────────────────────┼────────────────────────────┐
                       │                            │                            │
                       ▼                            ▼                            ▼
            ┌────────────────────┐     ┌────────────────────────┐     /XXXXXX → backend
            │  Vite SPA (React)  │     │  Express API (Node 24) │
            │  Redux + RTK Query │     │  routes → controllers  │
            └────────────────────┘     │  → services → drizzle  │
                                       └────────┬───────┬───────┘
                                                │       │
                                                │       │
                                                ▼       ▼
                                        ┌──────────┐ ┌─────────────┐
                                        │ Postgres │ │   Redis 8   │
                                        │ (urls,   │ │  CF filters │
                                        │  users,  │ │  ID pool    │
                                        │  joins)  │ │  click hash │
                                        └──────────┘ │  cache      │
                                                     │  BullMQ     │
                                                     └──────┬──────┘
                                                            │
                                       ┌────────────────────┼────────────────────┐
                                       ▼                    ▼                    ▼
                              ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                              │ flushWorker  │    │ idGenWorker  │    │cleanupWorker │
                              │  every 60s   │    │  every 10s   │    │  daily 03:00 │
                              └──────────────┘    └──────────────┘    └──────────────┘
```

### Request layering

`routes/` → `controllers/` → `services/` → `db/` (Drizzle) + `lib/redis.ts`. Services own all DB transactions and Redis side-effects; controllers parse input and shape responses. Validation is a middleware factory that compiles Zod schemas against `body`, `params`, or `query`.

### Workers run in-process

All three BullMQ schedulers are started from `apps/backend/src/index.ts` after Redis connects. The workers run alongside the HTTP server in the same Node process — no separate worker container required. For deployments with many backend replicas, you would extract these into their own service; the architecture is already structured to support that move (each `*Queue.ts` exports a `Queue`, each `*Worker.ts` is a side-effect import).

---

## How a short URL is born — and how it dies

This is the part that makes the project interesting. Skim the labels; the implementation is in [apps/backend/src/services/urlService.ts](apps/backend/src/services/urlService.ts).

### Creating a short URL — `POST /api/urls/shorten`

1. **Normalize**: lowercase scheme + host, sort query params, strip trailing slash, prepend `https://` if missing. ([apps/backend/src/lib/urlUtils.ts](apps/backend/src/lib/urlUtils.ts))
2. **Hash**: SHA-256 of the normalized URL → `urlHash`.
3. **Filter probe**: `CF.EXISTS cf:urlHashes <hash>`. If positive, look up the existing row and just add the user to `user_urls`. New owner, no new row, no new short ID.
4. **Pool pop**: `LPOP shortIdPool`. Falls back to `nanoid(6)` if the pool is empty (the worker is supposed to keep this from happening).
5. **Insert**: transactional `INSERT` into `urls` + `user_urls`, with `expiresAt = now + 30 days`.
6. **Filter add**: `CF.ADD cf:shortIds` + `CF.ADD cf:urlHashes`.

### Redirecting — `GET /:shortId`

This is the **hot path**. Latency targets the lower bound of "Redis round-trip + 302".

1. **Filter gate**: `CF.EXISTS cf:shortIds <id>`. False → instant `302 → /not-found`. **No DB query, ever.** False positives are statistically rare and only cost an extra DB miss; false negatives are impossible by construction.
2. **Cached lookup**: `getOrSetCache` reads the destination URL from Redis (key = `shortId`), populating from Postgres on miss.
3. **Redirect first**: respond with `302` immediately.
4. **Count later**: `HINCRBY clicks <shortId> 1` is fire-and-forget after the redirect is sent. Failure here logs but never blocks the redirect.

### Counting clicks — `flushWorker` (every 60s)

1. `HGETALL clicks` → `{shortId: count}`.
2. `bulkUpdateClicks` issues parallel updates: `clicks += count`, `lastAccessedAt = now`, `expiresAt = now + 30 days`.
3. `DEL clicks`.

This is why dashboard counters lag the actual click — by design. It trades real-time accuracy for ~60×fewer write transactions on hot links.

### Keeping the ID pool warm — `idGenWorker` (every 10s)

If `LLEN shortIdPool < 300`, top up to 1000:
1. Generate `nanoid(6)` candidates.
2. Filter out any that already exist in `cf:shortIds`.
3. `RPUSH` the survivors.

### Reclaiming dead IDs — `cleanupWorker` (boot + daily 03:00)

1. `SELECT … WHERE expires_at < NOW() LIMIT 100` (paginated).
2. For each: delete the join rows + the URL row, `CF.DEL` from both filters, drop the cache, `RPUSH` the freed short ID back onto the pool.
3. Loop until no expired rows remain.

A manual trigger is also exposed at `POST /api/urls/admin/cleanup` (requires the `x-admin-key` header).

### Multi-owner URL model

`user_urls` is a join table. If Alice and Bob both shorten `https://example.com/foo`, both get the same `shortId` and both have rows in `user_urls`. Deleting Alice's link removes only her row. The `urls` row (and the short ID) is reclaimed only when the last owner is removed — see [`removeUrlOwnership`](apps/backend/src/services/urlService.ts).

---

## Repository layout

```
url-shortener/
├── apps/
│   ├── backend/                 # Express + Drizzle + BullMQ
│   │   ├── src/
│   │   │   ├── controllers/     # request parsing, response shaping
│   │   │   ├── db/              # drizzle schema, migrations, pool
│   │   │   ├── jobs/            # bullmq queues + workers
│   │   │   │   ├── flush/       # batched click flush (60s)
│   │   │   │   ├── cleanup/     # expired-URL reclaim (daily 03:00)
│   │   │   │   └── idGen/       # short-ID pool refill (10s)
│   │   │   ├── lib/             # redis client, cache, logger, url utils
│   │   │   ├── middleware/      # auth, rate-limiter, validate
│   │   │   ├── routes/          # /api/users, /api/urls, /api/health
│   │   │   ├── services/        # transactional business logic
│   │   │   └── validation/      # zod schemas
│   │   ├── Dockerfile           # dev (hot reload via mounted source)
│   │   └── Dockerfile.prod      # multi-stage, non-root
│   │
│   └── frontend/                # React 19 + Vite 8
│       ├── src/
│       │   ├── components/      # ui/, auth/, layouts, route guards
│       │   ├── context/         # AuthContext
│       │   ├── pages/           # Landing, Auth, Dashboard, Shorten…
│       │   ├── store/           # redux store, slices, RTK Query api
│       │   └── lib/             # axios instance, cn() helper
│       ├── Dockerfile           # dev
│       ├── Dockerfile.prod      # multi-stage → nginx static + proxy
│       └── nginx.prod.conf      # /api → backend, /XXXXXX → backend
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml      # dev: pg + redis + backend + frontend + nginx
│   │   └── docker-compose.prod.yml # prod: healthchecks, no host volumes, prod images
│   └── nginx/nginx.conf            # dev edge proxy (port 8080)
│
├── packages/shared/               # placeholder for cross-app types
├── .github/workflows/ci.yml       # typecheck, lint, test, build
└── package.json                   # root-level dev orchestration
```

---

## Quick start

The fastest way to get running is `docker compose`. You need Docker Desktop (or Docker Engine + Compose v2) installed and that's it — no local Node, Postgres, or Redis required.

### 1. Clone

```bash
git clone https://github.com/suatsulun/url-shortener.git
cd url-shortener
```

### 2. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env — at minimum, set JWT_SECRET to a long random string.
```

The frontend `.env` is already wired for the dockerized stack (`http://localhost:8080/api`). If you only run the frontend natively, change it to `http://localhost:3001/api`.

### 3. Bring up the stack

```bash
docker compose -f infra/docker/docker-compose.yml up -d --build
```

This starts five containers: Postgres, Redis, the backend (with hot reload), the Vite dev server, and an Nginx edge proxy on **port 8080**.

### 4. Run the database migrations

The first time only — Drizzle migrations are applied from inside the backend container:

```bash
docker compose -f infra/docker/docker-compose.yml exec backend npm run db:migrate
```

### 5. Open the app

Visit **http://localhost:8080**, register an account, and shorten a link. The redirect path (e.g. `http://localhost:8080/abc123`) is proxied to the backend by Nginx.

### Stopping & resetting

```bash
docker compose -f infra/docker/docker-compose.yml down          # stop
docker compose -f infra/docker/docker-compose.yml down -v       # stop + wipe Postgres/Redis volumes
```

---

## Local development without Docker

If you'd rather run the apps natively against dockerized Postgres + Redis only:

```bash
# 1. Start just the data services
docker compose -f infra/docker/docker-compose.yml up -d postgres redis

# 2. Backend
cd apps/backend
cp .env.example .env                 # edit JWT_SECRET, etc.
npm install
npm run db:migrate
npm run dev                          # http://localhost:3001

# 3. Frontend (in another terminal)
cd apps/frontend
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env
npm install
npm run dev                          # http://localhost:5173
```

You can also run both apps concurrently from the repo root:

```bash
npm install
npm run dev    # uses concurrently to start backend + frontend
```

---

## Environment variables

### Backend (`apps/backend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string. |
| `REDIS_URL` | yes | Redis connection string. **Throws at startup if missing.** |
| `JWT_SECRET` | yes | Signing key for auth cookies. Use a long random string. |
| `ADMIN_KEY` | yes | Value expected in `x-admin-key` for admin routes. |
| `FRONTEND_URL` | yes | Origin allowed by CORS, also used to build returned `shortUrl`. |
| `PORT` | no | Default `3001`. |
| `LOG_LEVEL` | no | Pino level. Default `info`. |

### Frontend (`apps/frontend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | yes | Where the SPA sends API calls. `/api` in same-origin prod, `http://localhost:8080/api` in dockerized dev, `http://localhost:3001/api` for native dev. |

---

## Available scripts

From the **repo root** (orchestrates both apps):

| Script | Action |
|---|---|
| `npm run dev` | Start backend + frontend concurrently with colored output. |
| `npm run build` | Build both apps (`tsc` + `vite build`). |
| `npm run typecheck` | Typecheck both apps. |
| `npm run lint` | ESLint + Prettier check both apps. |
| `npm run format` | Prettier write both apps. |
| `npm test` | Run backend tests (Vitest). |
| `npm run clean` | Remove `dist/` from both apps. |

From **`apps/backend/`**:

| Script | Action |
|---|---|
| `npm run dev` | `tsx watch src/index.ts`. |
| `npm run build` / `npm start` | `tsc` then `node dist/index.js`. |
| `npm run db:generate` | Generate a Drizzle migration from the schema diff. |
| `npm run db:migrate` | Apply migrations from `src/db/migrations`. |
| `npm run db:studio` | Drizzle Studio (browse the DB). |
| `npm test` / `npm run test:watch` / `npm run test:ui` | Vitest. |

From **`apps/frontend/`**: the standard `dev`, `build`, `preview`, `lint`, `format`.

---

## API reference

All endpoints are JSON. Authenticated endpoints expect the `token` HTTP-only cookie set by `/api/users/login`. The frontend's axios instance sets `withCredentials: true` automatically.

### Auth — `/api/users`

| Method | Path | Auth | Body |
|---|---|---|---|
| `POST` | `/register` | — | `{ username, email, password }` |
| `POST` | `/login` | — | `{ identifier, password }` |
| `POST` | `/logout` | cookie | — |
| `GET`  | `/me` | cookie | — |
| `PATCH` | `/me` | cookie | `{ username?, email? }` |
| `PATCH` | `/me/password` | cookie | `{ currentPassword, newPassword }` |
| `DELETE` | `/me` | cookie | — |

`/register` and `/login` are rate-limited to 10 attempts per 15 minutes per IP.

### URLs — `/api/urls`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/shorten` | cookie | Body: `{ originalUrl }`. Returns `{ shortId, shortUrl, originalUrl }`. |
| `GET`  | `/me` | cookie | List the calling user's URLs. |
| `DELETE` | `/:shortId` | cookie | Remove the calling user's ownership of a URL. |
| `GET`  | `/:shortId` | — | **The redirect endpoint.** `302` to the original URL, or to `/not-found` if unknown. |
| `POST` | `/admin/cleanup` | `x-admin-key` | Manually trigger the expiry sweep. |

### Health

`GET /api/health` → `{ status: "ok" }`. Excluded from access logs.

---

## Database schema

Three tables, owned by Drizzle. See [apps/backend/src/db/schema/](apps/backend/src/db/schema/).

```
users                       urls                              user_urls (join)
─────                       ────                              ─────────
id  PK identity             id  PK identity                   user_id  FK users.id  ON DELETE CASCADE
username  UNIQUE            short_id  UNIQUE                  url_id   FK urls.id
email     UNIQUE            original_url                      created_at
password_hash               url_hash  UNIQUE                  PK (user_id, url_id)
created_at                  clicks    DEFAULT 0
                            created_at
                            last_accessed_at
                            expires_at
```

`urls.url_hash` is a SHA-256 of the normalized URL; its uniqueness is what makes deduplication work. `urls.short_id` is what users see in the public link.

Migrations live at [apps/backend/src/db/migrations](apps/backend/src/db/migrations) and are applied via `npm run db:migrate`. After editing a schema file, regenerate with `npm run db:generate`.

---

## Production deployment

The repo ships with a separate prod stack: [infra/docker/docker-compose.prod.yml](infra/docker/docker-compose.prod.yml). What it changes vs. dev:

- **Multi-stage builds.** Backend compiles TS in a build stage and runs `node dist/index.js` from a lean image as a non-root `app` user. Frontend builds the Vite bundle then serves it from `nginx:alpine`.
- **No host volume mounts.** Containers run from baked images, not your working tree.
- **Healthchecks.** Postgres (`pg_isready`) and Redis (`PING`) gate the backend's `depends_on`.
- **Same-origin API.** The frontend container's Nginx proxies `/api/*` and `/XXXXXX` to the backend over the Compose network. The frontend container is the only one that publishes a port (`3000:80`).

To deploy:

```bash
# 1. Provide production secrets
cp apps/backend/.env.prod.example infra/docker/.env
# Edit JWT_SECRET, ADMIN_KEY, FRONTEND_URL, POSTGRES_PASSWORD, etc.

# 2. Build & run
docker compose -f infra/docker/docker-compose.prod.yml up -d --build

# 3. Apply migrations (one-shot)
docker compose -f infra/docker/docker-compose.prod.yml exec backend npx drizzle-kit migrate --config=src/drizzle.config.ts
```

Put a TLS-terminating reverse proxy (Caddy, Traefik, or another Nginx) in front of port 3000 and you're done.

---

## Testing & CI

- **Backend unit tests** with Vitest cover URL normalization/hashing and the validation middleware. Run with `npm test` from `apps/backend/`.
- **GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs typecheck, lint, test, and build for both apps on every push to `main` and every PR.
- **Pre-commit** is enforced via Husky + lint-staged: Prettier on all changed files, ESLint `--fix` on frontend changes.

---

## Roadmap

Things this project deliberately stops short of, but which would be the natural next steps:

- **Custom aliases** (`POST /shorten` with an explicit `slug`).
- **Per-link analytics** (referrer, user-agent, country) — the redirect path already has the right hooks.
- **QR code generation** at link-creation time.
- **OAuth providers** (Google, GitHub) alongside username/password.
- **Multi-region Redis / read replicas** for the redirect path.
- **Workers as a separate service** for horizontal scaling beyond a single backend instance.

---

## License

Released under the [MIT License](LICENSE). You're free to use, modify, and distribute this code — just keep the copyright notice.

---

<div align="center">

Built by **[Suat Sülün](https://github.com/suatsulun)** as a portfolio project demonstrating end-to-end ownership of a small but non-trivial production system.

If you're a hiring manager reading this — the most interesting parts of the codebase are [`apps/backend/src/services/urlService.ts`](apps/backend/src/services/urlService.ts), [`apps/backend/src/jobs/`](apps/backend/src/jobs/), and the Cuckoo-Filter integration in [`apps/backend/src/lib/redis.ts`](apps/backend/src/lib/redis.ts). Start there.

</div>
