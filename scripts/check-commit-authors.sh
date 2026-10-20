#!/usr/bin/env bash
set -euo pipefail

# Author must be Yago. Committer may be Yago or GitHub (squash). No Co-authored-by.
EXPECTED_EMAIL='6538706+Yagogc@users.noreply.github.com'
GITHUB_COMMITTER_EMAIL='noreply@github.com'

check_range() {
  local repo="${REPO:-.}" base="$1" head="$2" sha ae ce msg fail=0
  while IFS= read -r sha; do
    [ -z "$sha" ] && continue
    ae=$(git -C "$repo" log -1 --format='%ae' "$sha")
    ce=$(git -C "$repo" log -1 --format='%ce' "$sha")
    msg=$(git -C "$repo" log -1 --format='%B' "$sha")
    if [ "$ae" != "$EXPECTED_EMAIL" ]; then
      echo "FAIL $sha author email=$ae want=$EXPECTED_EMAIL" >&2
      fail=1
    fi
    if [ "$ce" != "$EXPECTED_EMAIL" ] && [ "$ce" != "$GITHUB_COMMITTER_EMAIL" ]; then
      echo "FAIL $sha committer email=$ce want=$EXPECTED_EMAIL or $GITHUB_COMMITTER_EMAIL" >&2
      fail=1
    fi
    if printf '%s\n' "$msg" | grep -qiE '^[[:space:]]*Co-authored-by:'; then
      echo "FAIL $sha has Co-authored-by trailer" >&2
      fail=1
    fi
  done < <(git -C "$repo" rev-list --reverse "${base}..${head}")
  return "$fail"
}

cmd_check() {
  if [ "$#" -ne 2 ]; then
    echo "usage: check-commit-authors.sh check <base> <head>" >&2
    exit 2
  fi
  check_range "$1" "$2"
}

cmd_gha() {
  local base head
  case "${EVENT_NAME}" in
    pull_request)
      base="${BASE_SHA}"
      head="${PR_HEAD_SHA}"
      ;;
    push)
      base="${BEFORE_SHA}"
      head="${PUSH_SHA}"
      if [ -z "${base}" ] || [ "$base" = "0000000000000000000000000000000000000000" ]; then
        base="${head}^"
        git rev-parse --verify "$base" >/dev/null 2>&1 || {
          echo "ok empty history tip=$head"
          return 0
        }
      fi
      ;;
    *)
      echo "skip EVENT_NAME=${EVENT_NAME:-}" >&2
      return 0
      ;;
  esac
  check_range "$base" "$head"
}

case "${1:-}" in
  check) shift; cmd_check "$@" ;;
  gha) cmd_gha ;;
  *)
    echo "usage: check-commit-authors.sh check <base> <head>|gha" >&2
    exit 2
    ;;
esac
