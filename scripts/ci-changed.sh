#!/usr/bin/env bash
set -euo pipefail

# true: run CI and allow a deploy. false: every path is *.md or docs/.
should_run_ci() {
  local f any=false
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    any=true
    case "$f" in
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
  check empty "" true

  if git rev-parse --verify f8f566e >/dev/null 2>&1; then
    got=$(git diff --name-only f8f566e^ f8f566e | should_run_ci)
    if [ "$got" != "false" ]; then
      echo "FAIL f8f566e got=$got" >&2
      exit 1
    fi
    echo "ok f8f566e"
    got=$(git diff --name-only f634bcd^1 f634bcd | should_run_ci)
    if [ "$got" != "true" ]; then
      echo "FAIL f634bcd got=$got" >&2
      exit 1
    fi
    echo "ok f634bcd"

    local out
    out=$(mktemp)
    EVENT_NAME=push \
      BEFORE_SHA="$(git rev-parse f8f566e^)" \
      PUSH_SHA=f8f566e \
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
      BEFORE_SHA="$(git rev-parse f634bcd^1)" \
      PUSH_SHA=f634bcd \
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
      BASE_SHA="$(git rev-parse f8f566e^)" \
      PR_HEAD_SHA=f8f566e \
      GITHUB_OUTPUT="$out" \
      bash "$0" gha >/dev/null
    if ! grep -qx 'code=false' "$out"; then
      echo "FAIL gha docs pull_request" >&2
      cat "$out" >&2
      exit 1
    fi
    echo "ok gha docs pull_request"
    rm -f "$out"
  fi
}

cmd_gha() {
  local files base head code
  case "${EVENT_NAME}" in
    pull_request)
      base="${BASE_SHA}"
      head="${PR_HEAD_SHA}"
      files=$(git diff --name-only "$base...$head")
      ;;
    push)
      base="${BEFORE_SHA}"
      head="${PUSH_SHA}"
      if [ -z "${base}" ] || [ "$base" = "0000000000000000000000000000000000000000" ]; then
        echo "code=true" >> "$GITHUB_OUTPUT"
        return
      fi
      files=$(git diff --name-only "$base" "$head")
      ;;
    *)
      echo "code=true" >> "$GITHUB_OUTPUT"
      return
      ;;
  esac
  code=$(printf '%s\n' "$files" | should_run_ci)
  echo "code=$code" >> "$GITHUB_OUTPUT"
  echo "run_ci=$code"
  printf '%s\n' "$files"
}

# Exit 0 skips the Vercel build. Exit 1 builds.
cmd_vercel() {
  local base="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}" files code
  git rev-parse --verify "$base" >/dev/null 2>&1 || exit 1
  files=$(git diff --name-only "$base" HEAD)
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
