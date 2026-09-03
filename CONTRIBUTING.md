# Contributing

Thanks for helping out. This document covers the repo layout, the commands you will need, and how releases work.

## Repo layout

This is a pnpm workspace monorepo.

| Path | Contents |
| --- | --- |
| `packages/core` | The published package, `@mugenlabs/logtape-devtools`. Source in `src/`, Storybook config in `.storybook/`, bundled with tsup |
| `apps/demo` | Demo and documentation site (Vite + React + TanStack Router), deployed at logtape-devtools.mugenlabs.dev. Not published — it is in the Changesets ignore list |
| `e2e` | Playwright specs that drive the demo app and assert against a real DevTools panel |
| `scripts` | One-off repo scripts (e.g. OG image generation) |

Unit tests live next to the source they cover (`packages/core/src/**/*.test.ts`). Component tests are Storybook stories run through Vitest browser mode.

## Getting started

Requires Node 22 (see `.nvmrc`) and pnpm >=10.

```bash
pnpm install
pnpm build      # build packages/core once
pnpm dev        # tsup --watch on packages/core
pnpm dev:demo   # demo site on http://localhost:3001
```

The demo consumes the package via `workspace:*` and imports its built output, so run `pnpm build` (or keep `pnpm dev` running) before or alongside `pnpm dev:demo`.

## Commands

All of these run from the repo root:

| Command | What it does |
| --- | --- |
| `pnpm build` | Builds `packages/core` with tsup |
| `pnpm dev` | Rebuilds the package on change |
| `pnpm dev:demo` | Runs the demo site on port 3001 |
| `pnpm typecheck` | Builds, then typechecks `packages/core` and `apps/demo` |
| `pnpm test --run` | Unit tests (Vitest, jsdom) |
| `pnpm test-storybook` | Storybook component tests (Vitest browser mode, Chromium) |
| `pnpm test:e2e` | Playwright end-to-end tests against the demo |
| `pnpm lint` / `pnpm lint:fix` | Biome check, with or without `--write` |
| `pnpm storybook` | Storybook dev server on port 6006 |
| `pnpm changeset` | Adds a changeset for your change |

`pnpm test:e2e` starts the demo itself via Playwright's `webServer` (reusing an existing server if port 3001 is already taken). To point it at an already-running instance or a preview deployment, set `BASE_URL`, e.g. `BASE_URL=http://localhost:3011 pnpm test:e2e`.

## Before opening a PR

```bash
pnpm lint:fix
pnpm typecheck
pnpm test --run
```

Run `pnpm test-storybook` and `pnpm test:e2e` too if you touched the panel UI. CI runs the same checks.

## Releases

Releases are driven by [Changesets](https://github.com/changesets/changesets).

1. Make your change on a branch.
2. Run `pnpm changeset`, pick `@mugenlabs/logtape-devtools`, choose the bump (patch / minor / major), and write a short user-facing description. This writes a markdown file into `.changeset/` — commit it with your PR.
3. Open the PR. Any PR that changes package behaviour should include a changeset; docs-only or demo-only changes do not need one.
4. Once merged to `main`, the release workflow opens (or updates) a "Version Packages" PR that consumes the pending changesets, bumps the version, and updates the changelog.
5. Merging that release PR publishes to npm.

The demo app is ignored by Changesets and is never versioned or published.

## Conventions

- **Formatting and linting**: [Biome](https://biomejs.dev) with the [Ultracite](https://www.ultracite.ai) preset (`biome.jsonc`), 100-column lines. Run `pnpm lint:fix` rather than hand-formatting.
- **TypeScript**: strict, ESM only. Public API surface is re-exported from `packages/core/src/index.ts` (and the React-free `src/sink-entry.ts` for the `/sink` subpath) — add new exports there.
- **Tests**: [Vitest](https://vitest.dev). Unit tests are colocated with their source. Behaviour changes should come with a test.
- **Keep the docs in sync**: the public API is documented in three places — `packages/core/README.md`, the docs site (`apps/demo/src/pages/docs-page.tsx`), and the JSDoc on the exported functions. Update all three when an option changes.
- **Commits**: no strict convention enforced; a clear imperative subject line is enough.
