#!/usr/bin/env bash
set -euo pipefail

# true: run CI and allow a deploy. false: every path is *.md or docs/.
# Changesets are .md files but drive the next release, so they count as code.
should_run_ci() {
  local f any=false
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    any=true
    case "$f" in
      .changeset/*) printf 'true\n'; return ;;
      docs/*|*.md) ;;
      *) printf 'true\n'; return ;;
    esac
  done
  if [ "$any" = true ]; then
    printf 'false\n'
  else
    printf 'true\n'
  fi
}

cmd_test() {
  local name input want got
  check() {
    name="$1"
    input="$2"
    want="$3"
    got=$(printf '%s\n' "$input" | should_run_ci)
    if [ "$got" != "$want" ]; then
      echo "FAIL $name got=$got want=$want" >&2
      exit 1
    fi
    echo "ok $name"
  }

  check readme "README.md" false
  check agents "AGENTS.md" false
  check nested-md "packages/core/README.md" false
  check docs-dir "docs/guide/page.txt" false
  check several-docs "$(printf 'README.md\ndocs/a.md')" false
  check source "packages/core/src/sink.ts" true
  check mixed "$(printf 'README.md\npackages/core/src/sink.ts')" true
  check workflow ".github/workflows/ci.yml" true
  check vercel "vercel.json" true
  check changeset ".changeset/quiet-cats-dance.md" true
  check changeset-and-docs "$(printf 'README.md\n.changeset/quiet-cats-dance.md')" true
  check empty "" true

  if git rev-parse --verify ef9fa09 >/dev/null 2>&1; then
    got=$(git diff --name-only ef9fa09^ ef9fa09 | should_run_ci)
    if [ "$got" != "false" ]; then
      echo "FAIL ef9fa09 got=$got" >&2
      exit 1
    fi
    echo "ok ef9fa09"
    got=$(git diff --name-only f19ebdf^1 f19ebdf | should_run_ci)
    if [ "$got" != "true" ]; then
      echo "FAIL f19ebdf got=$got" >&2
      exit 1
    fi
    echo "ok f19ebdf"

    local out
    out=$(mktemp)
    EVENT_NAME=push \
      BEFORE_SHA="$(git rev-parse ef9fa09^)" \
      PUSH_SHA=ef9fa09 \
      GITHUB_OUTPUT="$out" \
      bash "$0" gha >/dev/null
    if ! grep -qx 'code=false' "$out"; then
      echo "FAIL gha docs push" >&2
      cat "$out" >&2
      exit 1
    fi
    echo "ok gha docs push"
    : >"$out"
    EVENT_NAME=push \
      BEFORE_SHA="$(git rev-parse f19ebdf^1)" \
      PUSH_SHA=f19ebdf \
      GITHUB_OUTPUT="$out" \
      bash "$0" gha >/dev/null
    if ! grep -qx 'code=true' "$out"; then
      echo "FAIL gha code push" >&2
      cat "$out" >&2
      exit 1
    fi
    echo "ok gha code push"
    : >"$out"
    EVENT_NAME=pull_request \
      BASE_SHA="$(git rev-parse ef9fa09^)" \
      PR_HEAD_SHA=ef9fa09 \
      GITHUB_OUTPUT="$out" \
      bash "$0" gha >/dev/null
    if ! grep -qx 'code=false' "$out"; then
      echo "FAIL gha docs pull_request" >&2
      cat "$out" >&2
      exit 1
    fi
    echo "ok gha docs pull_request"
    : >"$out"
    EVENT_NAME=schedule \
      GITHUB_OUTPUT="$out" \
      bash "$0" gha >/dev/null
    if ! grep -qx 'code=true' "$out"; then
      echo "FAIL gha schedule" >&2
      cat "$out" >&2
      exit 1
    fi
    echo "ok gha schedule"
    : >"$out"
    set +e
    EVENT_NAME=push \
      BEFORE_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
      PUSH_SHA="$(git rev-parse HEAD)" \
      GITHUB_OUTPUT="$out" \
      bash "$0" gha >/dev/null 2>&1
    status=$?
    set -e
    if [ "$status" -ne 0 ] || ! grep -qx 'code=true' "$out"; then
      echo "FAIL gha missing base exit=$status out=$(cat "$out")" >&2
      exit 1
    fi
    echo "ok gha missing base"

    set +e
    VERCEL_GIT_PREVIOUS_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa bash "$0" vercel >/dev/null 2>&1
    status=$?
    set -e
    if [ "$status" -ne 1 ]; then
      echo "FAIL vercel missing base exit=$status (want 1, build)" >&2
      exit 1
    fi
    echo "ok vercel missing base"

    set +e
    VERCEL_ENV=production VERCEL_GIT_PREVIOUS_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa bash "$0" vercel >/dev/null 2>&1
    status=$?
    set -e
    if [ "$status" -ne 0 ]; then
      echo "FAIL vercel production exit=$status (want 0, skip)" >&2
      exit 1
    fi
    echo "ok vercel production"

    local tmp script gone_sha docs_sha
    script="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
    tmp=$(mktemp -d)
    git init -q "$tmp"
    git -C "$tmp" config user.email "ci@example.com"
    git -C "$tmp" config user.name "ci"
    echo docs >"$tmp/readme.md"
    git -C "$tmp" add readme.md
    git -C "$tmp" commit -qm docs
    docs_sha=$(git -C "$tmp" rev-parse HEAD)
    echo gone >"$tmp/gone.md"
    git -C "$tmp" add gone.md
    git -C "$tmp" commit -qm gone
    gone_sha=$(git -C "$tmp" rev-parse HEAD)
    git -C "$tmp" reset --hard "$docs_sha" >/dev/null
    git -C "$tmp" reflog expire --expire=now --all
    git -C "$tmp" -c gc.reflogExpire=now -c gc.reflogExpireUnreachable=now gc --prune=now --quiet
    : >"$out"
    set +e
    (
      cd "$tmp"
      EVENT_NAME=push \
        BEFORE_SHA="$gone_sha" \
        PUSH_SHA="$docs_sha" \
        GITHUB_OUTPUT="$out" \
        bash "$script" gha >/dev/null 2>&1
    )
    status=$?
    set -e
    rm -rf "$tmp"
    if [ "$status" -ne 0 ] || ! grep -qx 'code=true' "$out"; then
      echo "FAIL gha force-push base exit=$status out=$(cat "$out")" >&2
      exit 1
    fi
    echo "ok gha force-push base"
    rm -f "$out"
  fi
}

cmd_gha() {
  local files base head code status=0
  case "${EVENT_NAME}" in
    pull_request)
      base="${BASE_SHA}"
      head="${PR_HEAD_SHA}"
      set +e
      files=$(git diff --name-only "$base...$head" 2>/dev/null)
      status=$?
      set -e
      ;;
    push)
      base="${BEFORE_SHA}"
      head="${PUSH_SHA}"
      if [ -z "${base}" ] || [ "$base" = "0000000000000000000000000000000000000000" ]; then
        echo "code=true" >> "$GITHUB_OUTPUT"
        return
      fi
      set +e
      files=$(git diff --name-only "$base" "$head" 2>/dev/null)
      status=$?
      set -e
      ;;
    *)
      echo "code=true" >> "$GITHUB_OUTPUT"
      return
      ;;
  esac
  if [ "$status" -ne 0 ]; then
    echo "Cannot diff ${base} ${head}; running full suite." >&2
    echo "code=true" >> "$GITHUB_OUTPUT"
    return
  fi
  code=$(printf '%s\n' "$files" | should_run_ci)
  echo "code=$code" >> "$GITHUB_OUTPUT"
  echo "run_ci=$code"
  printf '%s\n' "$files"
}

# Exit 0 skips the Vercel build. Exit 1 builds.
cmd_vercel() {
  local base="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}" files code
  # Production deploys come from the CI promote job, never from a Git build.
  if [ "${VERCEL_ENV:-}" = "production" ]; then
    exit 0
  fi
  # ^{commit} makes git check the object exists. A bare 40-char SHA always
  # "verifies", even when history was rewritten or the clone is too shallow.
  git rev-parse --verify --quiet "$base^{commit}" >/dev/null 2>&1 || exit 1
  files=$(git diff --name-only "$base" HEAD 2>/dev/null) || exit 1
  code=$(printf '%s\n' "$files" | should_run_ci)
  if [ "$code" = "true" ]; then
    exit 1
  fi
  exit 0
}

case "${1:-}" in
  test) cmd_test ;;
  gha) cmd_gha ;;
  vercel) cmd_vercel ;;
  *)
    echo "usage: ci-changed.sh test|gha|vercel" >&2
    exit 2
    ;;
esac
