#!/usr/bin/env bash
set -euo pipefail

# Author and committer email for every new commit. No Co-authored-by trailers.
REQUIRED_EMAIL='6538706+Yagogc@users.noreply.github.com'

git_repo() {
  git -C "${REPO:-.}" "$@"
}

check_commit() {
  local sha="$1" ae ce body
  ae=$(git_repo log -1 --format='%ae' "$sha")
  ce=$(git_repo log -1 --format='%ce' "$sha")
  body=$(git_repo log -1 --format='%B' "$sha")
  if [ "$ae" != "$REQUIRED_EMAIL" ]; then
    echo "FAIL $sha author email '$ae' (want $REQUIRED_EMAIL)" >&2
    return 1
  fi
  if [ "$ce" != "$REQUIRED_EMAIL" ]; then
    echo "FAIL $sha committer email '$ce' (want $REQUIRED_EMAIL)" >&2
    return 1
  fi
  if printf '%s\n' "$body" | grep -qiE '^[[:space:]]*Co-authored-by:'; then
    echo "FAIL $sha has Co-authored-by trailer" >&2
    return 1
  fi
  echo "ok $sha"
}

check_range() {
  local base="$1" head="$2" sha failed=0
  if [ -z "$base" ] || [ "$base" = "0000000000000000000000000000000000000000" ]; then
    check_commit "$head" || failed=1
    return "$failed"
  fi
  if ! git_repo rev-parse --verify "$base" >/dev/null 2>&1; then
    echo "Base $base missing; checking tip $head only." >&2
    check_commit "$head" || failed=1
    return "$failed"
  fi
  while IFS= read -r sha; do
    [ -z "$sha" ] && continue
    check_commit "$sha" || failed=1
  done < <(git_repo rev-list --reverse "${base}..${head}")
  return "$failed"
}

cmd_gha() {
  case "${EVENT_NAME}" in
    pull_request)
      check_range "${BASE_SHA}" "${PR_HEAD_SHA}"
      ;;
    push)
      check_range "${BEFORE_SHA}" "${PUSH_SHA}"
      ;;
    *)
      echo "Unknown EVENT_NAME=${EVENT_NAME}; checking HEAD." >&2
      check_commit HEAD
      ;;
  esac
}

cmd_test() {
  local script status out
  script="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
  TEST_TMP=$(mktemp -d)
  trap 'rm -rf "${TEST_TMP:-}"' EXIT
  local tmp="$TEST_TMP"

  git init -q "$tmp"
  git -C "$tmp" config user.name "Yago Gonzalez"
  git -C "$tmp" config user.email "$REQUIRED_EMAIL"

  echo a >"$tmp/a.txt"
  git -C "$tmp" add a.txt
  git -C "$tmp" commit -qm good-base
  local base
  base=$(git -C "$tmp" rev-parse HEAD)

  echo b >"$tmp/b.txt"
  git -C "$tmp" add b.txt
  git -C "$tmp" -c user.email=bad@example.com commit -qm bad-author
  local bad_author
  bad_author=$(git -C "$tmp" rev-parse HEAD)

  set +e
  REPO="$tmp" bash "$script" check "$base" "$bad_author" >/dev/null 2>"$tmp/err"
  status=$?
  set -e
  if [ "$status" -eq 0 ] || ! grep -q "author email" "$tmp/err"; then
    echo "FAIL expected bad author rejection" >&2
    cat "$tmp/err" >&2
    exit 1
  fi
  echo "ok rejects bad author"

  git -C "$tmp" reset --hard "$base" >/dev/null
  echo c >"$tmp/c.txt"
  git -C "$tmp" add c.txt
  git -C "$tmp" commit -qm 'bad trailer

Co-authored-by: Cursor <cursoragent@cursor.com>'
  local bad_trailer
  bad_trailer=$(git -C "$tmp" rev-parse HEAD)

  set +e
  REPO="$tmp" bash "$script" check "$base" "$bad_trailer" >/dev/null 2>"$tmp/err"
  status=$?
  set -e
  if [ "$status" -eq 0 ] || ! grep -q "Co-authored-by" "$tmp/err"; then
    echo "FAIL expected Co-authored-by rejection" >&2
    cat "$tmp/err" >&2
    exit 1
  fi
  echo "ok rejects Co-authored-by"

  git -C "$tmp" reset --hard "$base" >/dev/null
  echo d >"$tmp/d.txt"
  git -C "$tmp" add d.txt
  # Committer differs from author when -c overrides only one side at commit time.
  # Force a bad committer via env while keeping author config.
  set +e
  GIT_COMMITTER_NAME="Other" GIT_COMMITTER_EMAIL="other@example.com" \
    git -C "$tmp" commit -qm bad-committer
  set -e
  local bad_committer
  bad_committer=$(git -C "$tmp" rev-parse HEAD)

  set +e
  REPO="$tmp" bash "$script" check "$base" "$bad_committer" >/dev/null 2>"$tmp/err"
  status=$?
  set -e
  if [ "$status" -eq 0 ] || ! grep -q "committer email" "$tmp/err"; then
    echo "FAIL expected bad committer rejection" >&2
    cat "$tmp/err" >&2
    exit 1
  fi
  echo "ok rejects bad committer"

  git -C "$tmp" reset --hard "$base" >/dev/null
  echo e >"$tmp/e.txt"
  git -C "$tmp" add e.txt
  git -C "$tmp" commit -qm good-tip
  local good
  good=$(git -C "$tmp" rev-parse HEAD)

  out=$(REPO="$tmp" bash "$script" check "$base" "$good")
  if ! printf '%s\n' "$out" | grep -q "^ok $good$"; then
    echo "FAIL expected good commit pass" >&2
    printf '%s\n' "$out" >&2
    exit 1
  fi
  echo "ok accepts good commit"

  # History before the range is ignored even when authored badly.
  git -C "$tmp" reset --hard "$base" >/dev/null
  git -C "$tmp" -c user.email=legacy@example.com commit --allow-empty -qm legacy
  local legacy
  legacy=$(git -C "$tmp" rev-parse HEAD)
  echo f >"$tmp/f.txt"
  git -C "$tmp" add f.txt
  git -C "$tmp" commit -qm after-legacy
  local after
  after=$(git -C "$tmp" rev-parse HEAD)
  out=$(REPO="$tmp" bash "$script" check "$legacy" "$after")
  if ! printf '%s\n' "$out" | grep -q "^ok $after$"; then
    echo "FAIL expected range to skip legacy" >&2
    printf '%s\n' "$out" >&2
    exit 1
  fi
  if printf '%s\n' "$out" | grep -q "$legacy"; then
    echo "FAIL checked commit outside range" >&2
    printf '%s\n' "$out" >&2
    exit 1
  fi
  echo "ok skips commits outside range"
}

case "${1:-}" in
  test) cmd_test ;;
  gha) cmd_gha ;;
  check)
    check_range "${2:?base}" "${3:?head}"
    ;;
  *)
    echo "usage: check-commit-authors.sh test|gha|check <base> <head>" >&2
    exit 2
    ;;
esac
