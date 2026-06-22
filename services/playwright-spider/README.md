# @equalsite/playwright-spider

A dedicated **Node.js crawler service** that performs headless browser audits. It exposes a small Express API for job management, processes crawl jobs via **BullMQ**, runs **Playwright** + **Crawlee** for page discovery, and executes **axe-core** WCAG checks on every crawled page.

Events stream to Laravel through **Redis Streams**; completed artifact datasets are delivered via an HTTP callback.

---

## Responsibilities

| Concern | Implementation |
|---------|----------------|
| Job intake | Express API — enqueue / cancel audits |
| Job execution | BullMQ worker with configurable concurrency |
| Page crawling | Crawlee `PlaywrightCrawler` with same-domain link following |
| Accessibility scanning | `@axe-core/playwright` — WCAG 2.x / 2.2 AA tags |
| Progress reporting | Redis Stream publisher (`XADD`) |
| Artifact delivery | Zip Crawlee datasets → multipart POST to Laravel callback |
| Audit state | Redis-backed repository (`spider-cache:audits`) |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js (ESM) |
| HTTP | Express 5 |
| Browser automation | Playwright 1.60 |
| Crawling framework | Crawlee 3 |
| Accessibility | axe-core 4, `@axe-core/playwright` |
| Job queue | BullMQ 5 (Redis) |
| Redis client | ioredis 5.10.1 (pinned for BullMQ TS compatibility) |
| Build | tsup (ESM + DTS) |
| Dev | tsx watch |
| Testing | Vitest 4 |
| Shared types | `@equalsite/types` |

---

## Process model

Two processes run in production and development:

| Process | Entry | Command |
|---------|-------|---------|
| **API server** | `src/server.ts` | `pnpm dev` / `pnpm start` |
| **Worker** | `src/worker.ts` | `pnpm dev:worker` / `pnpm start:worker` |

Docker Compose runs both as separate services (`crawler-api` and `crawler-worker`) from the same image.

---

## API

Base path: `/api/v1`  
Authentication: `Authorization: Bearer <CRAWLER_SECRET>`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ping` | Health check |
| `POST` | `/audit` | Enqueue a new audit |
| `DELETE` | `/audit/:auditId` | Cancel a queued or running audit |

### Create audit request

```json
{
  "urls": ["https://example.com"],
  "callbackUrl": "http://web/api/crawler/callback",
  "options": {
    "maxPages": 10,
    "enqueueStrategy": "SameDomain"
  }
}
```

Response:

```json
{
  "data": {
    "auditId": "uuid",
    "status": "queued"
  }
}
```

Request/response types are defined in `@equalsite/types` (`src/node/api.ts`).

---

## Crawl & scan flow

```
POST /audit
  │
  ├─ Validate callback URL (probe request)
  ├─ Store AuditEntity in Redis
  └─ BullMQ: add job { auditId }  (job ID = audit ID for cancel-by-id)

Worker picks job
  │
  ├─ auditService.startAudit → Redis stream: audit.started
  ├─ PlaywrightCrawler.run(urls)
  │    └─ per page (handleAuditPageRequest):
  │         ├─ AxeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
  │         ├─ processAxeResult → Crawlee dataset + audit.page.completed
  │         └─ audit.progress event
  ├─ auditService.completeAudit → audit.completed
  ├─ releaseArtifacts: zip datasets → POST callback (multipart + Bearer)
  └─ performCleanUp: teardown crawler, delete Redis record, remove zip
```

### Key source files

```
src/
├── server.ts                          # HTTP server entry
├── worker.ts                          # BullMQ worker entry
├── app.ts                             # Express app setup
├── routes/index.ts                    # /api/v1 routes
├── app/controllers/auditController.ts
├── app/services/queue.ts              # BullMQ queue + worker factory
├── app/adapters/
│   ├── redisAuditRepository.ts        # Audit entity CRUD
│   └── redisStreamPublisher.ts        # XADD to STREAM_NAME
└── audit/
    ├── actions/
    │   ├── crawlerFactory.ts          # PlaywrightCrawler config
    │   ├── handleAuditPageRequest.ts  # axe-core per page
    │   ├── processAxeResult.ts        # Violation normalization
    │   ├── runAudit.ts                # Orchestration
    │   └── releaseArtifacts.ts        # Zip + callback
    └── services/auditService.ts       # Status transitions + events
```

### Crawler configuration

`crawlerFactory.ts` configures Crawlee's `PlaywrightCrawler` with:

- Resource blocking for fonts, media, and common analytics scripts (faster scans)
- Configurable `maxPages` and `enqueueStrategy` (e.g. same-domain link following)
- Per-page request handler delegating to axe-core

### axe-core integration

```typescript
const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .options({ resultTypes: ['violations'] })
    .analyze();
```

Only violations are collected (passes/incomplete are excluded by default). Results are pushed to the Crawlee dataset as JSON and included in the artifact zip sent to Laravel.

---

## Communication with Laravel

| Direction | Mechanism | Auth |
|-----------|-----------|------|
| Laravel → this service | HTTP `POST/DELETE /api/v1/audit` | Bearer `CRAWLER_SECRET` |
| This service → Laravel (events) | Redis Stream `equalsite:crawler:events` | — |
| This service → Laravel (data) | HTTP `POST /api/crawler/callback` | Bearer `CRAWLER_SECRET` |

Laravel's `php artisan crawler:listen` consumes the Redis Stream and maps events to domain events + WebSocket broadcasts. The callback delivers a zip containing Crawlee dataset JSON that Laravel's `ProcessAuditArtifacts` job parses into violation records.

---

## Storage

| Path | Contents |
|------|----------|
| `storage/artifacts/{auditId}/` | Crawlee dataset files during a run |
| `storage/archives/{auditId}.zip` | Zipped artifacts for callback (deleted after delivery) |
| Redis `spider-cache:audits` | In-flight audit entity state |
| Redis `crawl-queue` | BullMQ job queue |
| Redis `equalsite:crawler:events` | Event stream |

---

## Setup

### Docker (recommended)

From the monorepo root, `crawler-api` and `crawler-worker` start automatically:

```bash
docker compose up -d --build
```

Ensure root `.env` has `CRAWLER_SECRET` set. The API is available at `http://localhost:3000` (or `CRAWLER_PORT`).

### Native

Requires a running Redis instance:

```bash
# From monorepo root
pnpm install

# Terminal 1 — API
pnpm --filter @equalsite/playwright-spider dev

# Terminal 2 — Worker
pnpm --filter @equalsite/playwright-spider dev:worker
```

Environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CRAWLER_PORT` | `3000` | API listen port |
| `CRAWLER_SECRET` | — | Bearer token (required) |
| `REDIS_HOST` | `redis` | Redis for BullMQ + streams |
| `REDIS_PORT` | `6379` | |
| `STREAM_NAME` | `equalsite:crawler:events` | Event stream key |

### Production build

```bash
pnpm build            # tsup → dist/server.js, dist/worker.js
pnpm start            # node dist/server.js
pnpm start:worker     # node dist/worker.js
```

Playwright browsers must be installed in the deployment environment (`npx playwright install chromium`).

---

## Scripts

```bash
pnpm dev              # API with tsx watch
pnpm dev:worker       # Worker with tsx watch
pnpm build            # Production ESM build + DTS
pnpm start            # Run built API
pnpm start:worker     # Run built worker
pnpm test             # Vitest
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint
```

---

## Testing

```bash
pnpm test
```

Vitest is configured for unit tests. Run from this directory or via `pnpm test` at the monorepo root (Turbo).

---

## Design decisions

**Separate API and worker processes** — The API stays responsive for enqueue/cancel while workers scale independently. BullMQ handles retries, job deduplication (audit ID as job ID), and graceful cancellation.

**Redis Streams over HTTP webhooks for progress** — Progress events are high-frequency and fire-and-forget. Streams provide durable delivery with consumer groups, so Laravel can catch up after restarts without the crawler tracking delivery state.

**Crawlee datasets as the artifact format** — Crawlee's built-in dataset storage produces structured JSON per page. Zipping and POSTing this to Laravel keeps the crawler stateless after cleanup — Laravel owns persistence.

**Shared types via `@equalsite/types`** — `EventEnum`, `CreateAuditRequestBody`, and stream payload types are authored once and imported here and in the React frontend, preventing contract drift between the three runtimes (Node API, Node worker UI types, React).

**ioredis version pin** — Locked to `5.10.1` to match BullMQ's peer dependency and avoid TypeScript compatibility issues with newer ioredis releases.

---

## Event types

Published to `STREAM_NAME` (consumed by Laravel's `crawler:listen`):

| Event | When |
|-------|------|
| `audit.started` | Worker begins crawling |
| `audit.progress` | Page scan completes (includes % and severity breakdown) |
| `audit.page.completed` | Individual page axe results available |
| `audit.completed` | All pages scanned, artifacts released |
| `audit.failed` | Unrecoverable error during crawl |

Event shapes are defined in `@equalsite/types` (`src/events.ts`) and mapped in Laravel's `ConsumeCrawlerStreams` command.
