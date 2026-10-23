# Agent guidelines

Guidance for coding agents and automated contributors working in this repository. Human contributors should read [CONTRIBUTING.md](CONTRIBUTING.md), which covers the repo layout, commands, and release process; everything there applies here too.

## Before you finish

Run the same checks CI runs and report the results:

```bash
pnpm lint:fix
pnpm typecheck
pnpm test:ci
```

Also run `pnpm test-storybook` and `pnpm test:e2e` if you touched the panel UI or the demo.

Changes to `packages/core` that affect users need a test and a changeset (`pnpm changeset`). The demo app is never published and does not need one. When the public API changes, update the root README (then `pnpm readme:sync`), the docs site, and the JSDoc.

## Reporting

When you push, deploy, or open a pull request, end with a summary: the commit or PR link, the deploy state, which checks passed, and screenshot paths for visual changes.

## Visual changes

Unless the request picks one approach, offer two or three options as screenshots and keep every constraint the request lists. Look at the screenshots yourself before calling visual work done.

Do not replace a requested test with a weaker one.

## Scope

Keep changes to what was asked and follow the existing patterns. Small requests should land as one focused change, not a series of pushes. Don't add dependencies without a clear reason.

The organization is spelled **Mugenlabs**.

## CI

- Docs-only changes (`*.md` and `docs/`) skip lint, tests, build, and deploy. Changesets (`.changeset/*.md`) count as code, because they drive the next release. The workflow still starts. `scripts/ci-changed.sh` classifies the diff, and each job checks the result, so required checks report skipped instead of staying pending.
- The full suite takes a couple of minutes, so pull requests run all of it.
- `pull_request` covers branches. `push` covers `main` only, so each change runs the workflow once. A nightly `schedule` run executes the full suite, so new advisories and upstream breakage show up between changes.
- Pull requests that change `packages/core` (outside tests and stories) must add a changeset; `scripts/check-changeset.sh` enforces it.
- The unit and Storybook tests also run against the oldest and newest versions the peer ranges allow (`scripts/pin-peer-versions.mjs`).
- `pnpm audit:published` blocks on advisories in the published package's dependencies. `pnpm audit:workspace` covers dev tools and the demo and only reports.
- Actions are pinned to a full commit SHA with the version in a comment (`uses: actions/checkout@<sha> # v7.0.1`). To bump one, resolve the new tag with `git ls-remote --tags https://github.com/<owner>/<repo>` (use the `^{}` line for annotated tags) and update the SHA and the comment together.
- Every job sets `timeout-minutes`. Keep timeouts tight, with headroom over the slowest observed run.
- CI does not cache the pnpm store or Playwright browsers. Measured, neither beat a fresh install.
- Production deploys once per code commit, from the CI promote job. Vercel git deploys are off for `main`. Preview builds use the same path rule through `ignoreCommand`.
- npm releases run in the `release` job after promote, so a version is only published once the same commit passed CI and the preview e2e.
