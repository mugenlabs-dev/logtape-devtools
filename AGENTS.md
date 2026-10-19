# Standing rules (Yago, 2026-10-19)

Every worker on logtape-devtools follows these.

## Ship report

Any run that ships something (a push to main, a deploy, a PR opened, or a PR going green) must end with a full ship report: the PR or commit link, the deploy state, which checks passed, and screenshot paths for visual work. Never reply "nothing to send" or "same status" after a ship.

## Visual changes

Unless the brief picks one approach, deliver 2–3 options as screenshots in one round so Yago can choose, and keep every constraint the brief lists. Never swap the test you were asked for with a weaker one. Before calling visual work done, look at the screenshot yourself and say in one line what you checked.

## Small asks

One worker, no side agents, and one push at the end.

Company spelling: **Mugenlabs**.

## CI baseline

Mugenlabs CI for this repo.

Docs-only changes (`*.md` and `docs/`) skip lint, tests, build, and deploy. The workflow still starts. `scripts/ci-changed.sh` classifies the diff, and each other job has an `if`, so a required check reports skipped instead of staying pending.

The suite is under 2 minutes, so pull requests run all of it. On the 2026-10-19 docs run the unit step took 4s, Storybook tests took 7s, and the e2e step took 25s. There is no affected-test split, no nightly full run, and no sharding.

A change runs this workflow once. `pull_request` covers branches. `push` covers `main` only.

Each job sets `timeout-minutes` from runs through 2026-10-19. Path filter, lint, promote, and release use 2 minutes. Storybook, build, and preview e2e use 3. Local e2e and the preview deploy use 4. Build is 3 because one run took 82s, above 3× its 21s median.

The pnpm store cache and the Playwright browser cache do not beat a fresh install here. A warm pnpm cache tied a fresh install once restore time was included, and saving the cache on the e2e container took 22–24s. A Playwright cache hit was 17s, 17s, and 46s against a fresh browser install of 23–27s. CI does not cache either.

Production deploys once per code commit, from the CI promote job. Vercel git deploys are off for `main`. Docs-only commits do not deploy. Preview builds use the same path rule through `ignoreCommand`.
