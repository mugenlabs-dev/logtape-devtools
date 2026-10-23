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

Changes to `packages/core` that affect users need a changeset (`pnpm changeset`). The demo app is never published and does not need one.

## Reporting

When you push, deploy, or open a pull request, end with a summary: the commit or PR link, the deploy state, which checks passed, and screenshot paths for visual changes.

## Visual changes

Unless the request picks one approach, offer two or three options as screenshots and keep every constraint the request lists. Look at the screenshots yourself before calling visual work done.

Do not replace a requested test with a weaker one.

## Scope

Keep changes to what was asked. Small requests should land as one focused change, not a series of pushes.

The organization is spelled **Mugenlabs**.

## CI

- Docs-only changes (`*.md` and `docs/`) skip lint, tests, build, and deploy. The workflow still starts. `scripts/ci-changed.sh` classifies the diff, and each job checks the result, so required checks report skipped instead of staying pending.
- The full suite takes a couple of minutes, so pull requests run all of it.
- `pull_request` covers branches. `push` covers `main` only, so each change runs the workflow once.
- Actions are pinned to a full commit SHA with the version in a comment (`uses: actions/checkout@<sha> # v4.4.0`). To bump one, resolve the new tag with `git ls-remote --tags https://github.com/<owner>/<repo>` (use the `^{}` line for annotated tags) and update the SHA and the comment together.
- Every job sets `timeout-minutes`. Keep timeouts tight, with headroom over the slowest observed run.
- CI does not cache the pnpm store or Playwright browsers. Measured, neither beat a fresh install.
- Production deploys once per code commit, from the CI promote job. Vercel git deploys are off for `main`. Preview builds use the same path rule through `ignoreCommand`.
