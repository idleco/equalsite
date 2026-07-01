---
name: run-web
description: Build, run, screenshot, and test the Equalsite web app (@equalsite/web). Use when asked to start the web app, take a screenshot, run the Laravel tests, check a page, or interact with the running UI.
---

Equalsite's web app is a Laravel 13 + React 19 (Inertia.js) SPA served by Docker Compose. Drive it via `.claude/skills/run-web/driver.mjs` — a Playwright script that uses system Chrome (`/usr/bin/google-chrome`) and Playwright from `services/playwright-spider/node_modules/playwright`. No extra installs needed.

All paths below are relative to `apps/web/`.

## Prerequisites

The full stack runs in Docker Compose (monorepo root). The Vite dev server must run **on the host** (not in Docker).

```bash
# From monorepo root — starts web/crawler/mysql/redis/soketi/memcached
docker compose up -d

# From monorepo root — Vite HMR on host (required for React to render)
pnpm --filter @equalsite/web dev
```

Verify the app is up:

```bash
curl -sfL http://localhost/ | grep -q 'Equalsite\|audit/create\|login' && echo "UP" || echo "DOWN"
```

## Setup (first time)

```bash
# Run DB migrations
docker compose exec web php artisan migrate

# Create a driver test user (only once)
docker compose exec web php artisan tinker --no-interaction <<'EOF'
\App\Models\User::factory()->create([
    'name' => 'Test User',
    'email' => 'skill@equalsite.test',
    'password' => \Illuminate\Support\Facades\Hash::make('password'),
    'email_verified_at' => now(),
]);
EOF
```

The driver defaults to `skill@equalsite.test / password`. Override with `--email` / `--password` flags.

## Run (agent path)

Navigate to any page after login and take a screenshot:

```bash
# From apps/web/
node .claude/skills/run-web/driver.mjs --url /dashboard --name dashboard --out /tmp/shots
node .claude/skills/run-web/driver.mjs --url /audit/create --name scan-request --out /tmp/shots
```

Driver flags:

| flag | default | description |
|---|---|---|
| `--url` | `/dashboard` | Path (or full URL) to navigate to after login |
| `--out` | `/tmp/equalsite-shots` | Directory where screenshots land |
| `--name` | `shot` | Screenshot filename (without .png) |
| `--no-login` | false | Skip the login step (for public pages) |
| `--email` | `skill@equalsite.test` | Login email |
| `--password` | `password` | Login password |

Screenshots land at `{out}/{name}.png`. The driver also prints the final URL, page title, and any JS console errors.

## Run (human path)

```bash
# From monorepo root
docker compose up -d          # all services
pnpm --filter @equalsite/web dev   # Vite HMR (separate terminal)
# Open http://localhost/ in browser
```

## Test

```bash
# Migrate testing database (first time only — testing DB exists but starts empty)
docker compose exec web bash -c "DB_DATABASE=testing php artisan migrate --force"

# Run all tests
docker compose exec web php artisan test --no-coverage
```

Expected: ~37–38/40 pass. Known failures unrelated to infrastructure:
- `RegistrationTest` — home route redirects to `/audit/create` not `/dashboard`
- `ExampleTest` — same home route mismatch
- `ProfileUpdateTest` — flaky when `test@example.com` already exists in testing DB from a prior non-rolled-back run; re-run clears it

---

## Gotchas

- **Vite must run on the HOST, not in Docker.** The Laravel app embeds Vite asset URLs as `http://127.0.0.1:5174/`. Inside a container, that's the container's own loopback — Playwright inside Docker can't reach it, so React doesn't mount. Always run `pnpm --filter @equalsite/web dev` from the host before using the driver.

- **After login, Fortify redirects to `/dashboard`, not `/audit/create`.** The home route is `/audit/create` but Fortify's post-login redirect is `home` → `/dashboard`. If you `waitForURL('/audit/create')` after submitting the login form, you'll time out.

- **Report and progress routes use `crawler_id` (UUID), not `id`.** The route is `/audit/{id}` where `{id}` is the `crawler_id` column (a UUID), not the database primary key. `Audit::find(3)->crawler_id` gives the right value.

- **Audit detail pages 500 on older DB records.** `app/Value/ScannedUrl.php:38` throws `Undefined array key "status"` for audits stored before the current schema. This is a WIP issue tracked in recent commits (remediation groups / report page). Newly-created audits via the UI will use the updated format.

- **Testing DB needs manual migration.** `php artisan test` uses `DB_DATABASE=testing` (set in `phpunit.xml`) but `php artisan migrate --env=testing` doesn't pick that up — you need `DB_DATABASE=testing php artisan migrate --force` explicitly.

## Troubleshooting

- **`browserType.launch: Executable doesn't exist`** — Playwright is looking for its own browser bundle. Fix: the driver explicitly sets `executablePath: '/usr/bin/google-chrome'`. If you copied the driver elsewhere, restore that line.

- **`page.waitForURL: Timeout exceeded`, navigated to `/dashboard`** — You're waiting for `/audit/create` after login. Fortify sends you to `/dashboard` first. Wait for `/dashboard` then navigate.

- **`QueryException: Table 'testing.users' doesn't exist`** — The testing database hasn't been migrated. Run: `docker compose exec web bash -c "DB_DATABASE=testing php artisan migrate --force"`

- **`500 ErrorException: Undefined array key "status"` on `/audit/{id}`** — Legacy audit record with old `custom_data` format. Create a fresh audit via the UI to get compatible data.
