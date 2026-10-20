#!/usr/bin/env bash
set -euo pipefail

# Author and committer email for every new commit. No Co-authored-by trailers.
EXPECTED_EMAIL='6538706+Yagogc@users.noreply.github.com'

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
    if [ "$ce" != "$EXPECTED_EMAIL" ]; then
      echo "FAIL $sha committer email=$ce want=$EXPECTED_EMAIL" >&2
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

cmd_test() {
  local script base good bad_author bad_committer bad_co
  script="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
  TEST_TMP=$(mktemp -d)
  trap 'rm -rf "${TEST_TMP:-}"' EXIT

  git init -q "$TEST_TMP"
  git -C "$TEST_TMP" config user.name "Yago Gonzalez"
  git -C "$TEST_TMP" config user.email "$EXPECTED_EMAIL"
  echo a >"$TEST_TMP/a.txt"
  git -C "$TEST_TMP" add a.txt
  git -C "$TEST_TMP" commit -qm base
  base=$(git -C "$TEST_TMP" rev-parse HEAD)

  echo b >"$TEST_TMP/b.txt"
  git -C "$TEST_TMP" add b.txt
  git -C "$TEST_TMP" commit -qm good
  good=$(git -C "$TEST_TMP" rev-parse HEAD)
  if ! REPO="$TEST_TMP" bash "$script" check "$base" "$good"; then
    echo "FAIL expected good commit to pass" >&2
    exit 1
  fi
  echo "ok good author"

  echo c >"$TEST_TMP/c.txt"
  git -C "$TEST_TMP" add c.txt
  git -C "$TEST_TMP" -c user.email=agent@example.com commit -qm bad-author
  bad_author=$(git -C "$TEST_TMP" rev-parse HEAD)
  if REPO="$TEST_TMP" bash "$script" check "$good" "$bad_author"; then
    echo "FAIL expected wrong author to fail" >&2
    exit 1
  fi
  echo "ok rejects wrong author"

  git -C "$TEST_TMP" reset --hard "$good" >/dev/null
  echo d >"$TEST_TMP/d.txt"
  git -C "$TEST_TMP" add d.txt
  GIT_AUTHOR_NAME="Yago Gonzalez" \
    GIT_AUTHOR_EMAIL="$EXPECTED_EMAIL" \
    GIT_COMMITTER_NAME="Other" \
    GIT_COMMITTER_EMAIL="committer@example.com" \
    git -C "$TEST_TMP" commit -qm bad-committer
  bad_committer=$(git -C "$TEST_TMP" rev-parse HEAD)
  if REPO="$TEST_TMP" bash "$script" check "$good" "$bad_committer"; then
    echo "FAIL expected wrong committer to fail" >&2
    exit 1
  fi
  echo "ok rejects wrong committer"

  git -C "$TEST_TMP" reset --hard "$good" >/dev/null
  echo e >"$TEST_TMP/e.txt"
  git -C "$TEST_TMP" add e.txt
  git -C "$TEST_TMP" commit -qm "$(printf 'bad co\n\nCo-authored-by: Cursor <cursoragent@cursor.com>\n')"
  bad_co=$(git -C "$TEST_TMP" rev-parse HEAD)
  if REPO="$TEST_TMP" bash "$script" check "$good" "$bad_co"; then
    echo "FAIL expected Co-authored-by to fail" >&2
    exit 1
  fi
  echo "ok rejects Co-authored-by"

  if ! REPO="$TEST_TMP" bash "$script" check "$good" "$good"; then
    echo "FAIL expected empty range to pass" >&2
    exit 1
  fi
  echo "ok empty range"
}

case "${1:-}" in
  test) cmd_test ;;
  check) shift; cmd_check "$@" ;;
  gha) cmd_gha ;;
  *)
    echo "usage: check-commit-authors.sh test|check <base> <head>|gha" >&2
    exit 2
    ;;
esac
