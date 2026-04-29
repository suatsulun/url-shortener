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

- [The Project](#the-project)
- [Feature highlights](#feature-highlights)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [How it works?](#how-it-works)
- [Repository layout](#repository-layout)
- [Quick start](#quick-start)
- [Available scripts](#available-scripts)
- [Production deployment](#production-deployment)
- [License](#license)

---

## The Project

This URL shortener was written by me to both to have it as a big project for my portfolio and to learn how to use some of the tools I wanted to work with. Even though it won't see thousands of users I wanted to build it to withstand tens of thousands of requests per second. So I used some tools that weren't necessary to optimize the performance and I also used some tools that would drop the performance just because I wanted to experiment with them.

In this repo there is a full-stack, self-hostable URL shortener uses React+Typescript for the frontend, Express for the backend, Postgres for the database and Redis for the cache. They all run on a docker container.

There is a dashboard where you can see all your shortened urls, click counts and their expiration dates. In the API when a URL is sent by the user, the API normalizes it (adding https:// if missing, lowercasing the protocol+hostname, ordering the params, and deleting the ending "/"), hashes it, gets a shortId from the Redis pool (creates a shortId with nanoid(6) if there are none), stores it in the database and links the user id to the url id after. 

---

## Feature highlights

- **Sub-millisecond 404 path.** Since there is a Cuckoo Filter in Redis if the shortId doesnt exist there you get a 404 lightning fast.
- **Pre-generated ID pool.** A background worker keeps 1,000 shortIds warm in a Redis list and tops it to 1000 if they get below a certain number.
- **Duplicate URL deduplication.** URLs get normalized first. If the normalized URL exists on the database the user who added it again is just added to a joined database that holds the URL-Owner relationships.
- **Async click counting.** Each redirect sends an incrementation to the Redis connected to the shortId, and a worker checks those incrementations and add them in one minute batches to the database.
- **Sliding 30-day TTL.** URLs expire 30 days after last access. A daily worker checks the expiration dates everyday at 3:00 AM and deletes the ones that are expired.
- **Cookie-based JWT auth.** Authentication is checked via an HTTP-only cookie.
- **Rate limiting.** There is a global 100 requests per minute limiter and also a 10 requests per 15 minutes limiter for login/register routes.
- **Structured logging.** Logging is done by Pino.
- **Two-stage Docker builds.** Production docker sets the NGINX inside the frontend but the developement docker sets a seperate NGINX container to handle the proxies.

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

---

## How it works?


### Creating a short URL `POST /api/urls/shorten`

1. **Normalize**: lowercase the protocol and the hostname, add `https://` to the front of it if missing, sort the params and remove the ending `/` if exists.
2. **Hash**: SHA-256 of the normalized URL → `urlHash`.
3. **Filter probe**: If the `urlHash` lives in the Cuckoo Filter look up the database for it. If it exists just add the owner to the `user_urls` table, return the existing shortId. If it doesn't exist continue.
4. **Pool pop**: Just `LPOP` from the `shortIdPool` that lives in Redis. Creates a new `nanoid(6)` if the pool is empty.
5. **Insert**: Write all the information to the `urls` table in the database. Connect the owner id to the url id in the `user_urls` table.
6. **Filter add**: Add the shortId and the hash to the Cuckoo Filter.

### Redirecting `GET /:shortId`

1. **Filter gate**: `CF.EXISTS cf:shortIds <id>`. False → instant `redirect → /not-found`. **No DB query, ever.** Since a Cuckoo Filter cannot give a false negative each `:shortId` that doesn't exist gets redirected to the `not-found` page.
2. **Cached lookup**: `getOrSetCache` reads the URL from Redis (key = `shortId`). If it doesn't exist on the cache looks at the database and add it to the cache for 30 mins.
3. **Redirect first**: Redirect the user to the URL immediately. 
4. **Count later**: `HINCRBY clicks <shortId> 1` is fired after the redirect happens. If there is an error here it is logged but doesn't stop the redirection. Counts are added to the database by a worker later on.

### Keeping track of clicks `flushWorker` (every 60s)

1. Worker gets every click count connected to each shortId from the Redis cache.
2. Updates the click counter on each url row and updates their expiration date.
3. Delete the counts from Redis.


### Keeping a shortId pool `idGenWorker` (every 10s)

If shortId pool is less than 300:
1. Generate enough `nanoid(6)` to top it.
2. Remove any that already exist in `cf:shortIds`.
3. `RPUSH` the ones not removed.

### Removing expired urls `cleanupWorker` (boot + daily 03:00)

1. Select every url that has an expiration date in the past by the check time.
2. Delete the row for each url, remove the shortId and the hash from the Cuckoo Filter, drop the cache, `RPUSH` the freed shortId back into the pool.


### Multi-owner URL

`user_urls` is a join table. If Alice and Bob both shorten `https://example.com/foo`, both get the same `shortId` and both have rows in `user_urls`. Deleting Alice's link removes only her row. The `urls` row (and the short ID) is reclaimed only when the last owner is removed.

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

You just need to `docker compose` after cloing the git repo. You need Docker Desktop (or Docker Engine + Compose v2) installed and that's it.

### 1. Clone

```bash
git clone https://github.com/suatsulun/url-shortener.git
cd url-shortener
```

### 2. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

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

## License

Released under the [MIT License](LICENSE). You're free to use, modify, and distribute this code. Just keep the copyright notice.

---

<div align="center">

Built by **[Suat Sülün](https://github.com/suatsulun)** as a portfolio project demonstrating end-to-end ownership of a small but non-trivial production system.

</div>
