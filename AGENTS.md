## Learned User Preferences

- Expect fixes to be verified before reporting success, with a concise explanation of cause and change.
- When changing shared types in `packages/types`, prefer dev-time source resolution so React and playwright-spider pick up edits without manual rebuilds.

## Learned Workspace Facts

- pnpm + Turbo monorepo with workspaces under `apps/*`, `services/*`, and `packages/*`.
- Shared types live in `@equalsite/types`; production consumers use `dist/`, dev uses the `source` export condition to `src/`.
- `@equalsite/types` builds via tsup on `pnpm install` (`prepare`) and as a Turbo `^build` dependency.
- Crawler stack: `services/playwright-spider` (Node API + BullMQ worker); Laravel `apps/web` consumes Redis stream events via `crawler:listen`.
- In `@equalsite/types`, export `./node/index` explicitly (not `./node`) to avoid `@types/node` resolution collision during DTS builds.
- playwright-spider must pin `ioredis` to `5.10.1` (exact) to match bullmq's peer version for TypeScript compatibility.
- TypeScript 6 deprecation flags like `ignoreDeprecations: '6.0'` belong in tsup `dts.compilerOptions`, not root `tsconfig.json`, to avoid IDE validation errors.
