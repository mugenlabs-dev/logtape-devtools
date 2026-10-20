#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
script="${root}/check-commit-authors.sh"
EXPECTED_EMAIL='6538706+Yagogc@users.noreply.github.com'
GITHUB_COMMITTER_EMAIL='noreply@github.com'

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

expect() {
  local want="$1"
  shift
  set +e
  "$@" >/tmp/check-commit-authors-test.out 2>&1
  local got=$?
  set -e
  if [ "$got" -ne "$want" ]; then
    echo "command: $*" >&2
    cat /tmp/check-commit-authors-test.out >&2
    fail "exit $got, want $want"
  fi
}

run_check() {
  REPO="$1" bash "$script" check "$2" "$3"
}

tmp=$(mktemp -d)
trap 'rm -rf "${tmp:-}"' EXIT
git init -q "$tmp"
git -C "$tmp" config user.name "Yago Gonzalez"
git -C "$tmp" config user.email "$EXPECTED_EMAIL"

echo seed >"$tmp/seed.txt"
git -C "$tmp" add seed.txt
git -C "$tmp" commit -qm seed
base=$(git -C "$tmp" rev-parse HEAD)

echo good >"$tmp/good.txt"
git -C "$tmp" add good.txt
git -C "$tmp" commit -qm good
good=$(git -C "$tmp" rev-parse HEAD)
expect 0 run_check "$tmp" "$base" "$good"
echo "ok good author"

echo squash >"$tmp/squash.txt"
git -C "$tmp" add squash.txt
GIT_AUTHOR_NAME="Yago Gonzalez" \
  GIT_AUTHOR_EMAIL="$EXPECTED_EMAIL" \
  GIT_COMMITTER_NAME="GitHub" \
  GIT_COMMITTER_EMAIL="$GITHUB_COMMITTER_EMAIL" \
  git -C "$tmp" commit -qm github-squash
squash=$(git -C "$tmp" rev-parse HEAD)
expect 0 run_check "$tmp" "$good" "$squash"
echo "ok GitHub committer"

echo bad-author >"$tmp/bad-author.txt"
git -C "$tmp" add bad-author.txt
git -C "$tmp" -c user.email=agent@example.com commit -qm bad-author
bad_author=$(git -C "$tmp" rev-parse HEAD)
expect 1 run_check "$tmp" "$squash" "$bad_author"
grep -q "author email" /tmp/check-commit-authors-test.out || fail "missing author email message"
echo "ok rejects wrong author"

echo bad-co >"$tmp/bad-co.txt"
git -C "$tmp" add bad-co.txt
git -C "$tmp" commit -qm "$(printf 'bad co\n\nCo-authored-by: Cursor <cursoragent@cursor.com>\n')"
bad_co=$(git -C "$tmp" rev-parse HEAD)
expect 1 run_check "$tmp" "$bad_author" "$bad_co"
grep -qi "Co-authored-by" /tmp/check-commit-authors-test.out || fail "missing Co-authored-by message"
echo "ok rejects Co-authored-by"

git -C "$tmp" reset --hard "$squash" >/dev/null
echo bad-committer >"$tmp/bad-committer.txt"
git -C "$tmp" add bad-committer.txt
GIT_AUTHOR_NAME="Yago Gonzalez" \
  GIT_AUTHOR_EMAIL="$EXPECTED_EMAIL" \
  GIT_COMMITTER_NAME="Other" \
  GIT_COMMITTER_EMAIL="committer@example.com" \
  git -C "$tmp" commit -qm bad-committer
bad_committer=$(git -C "$tmp" rev-parse HEAD)
expect 1 run_check "$tmp" "$squash" "$bad_committer"
grep -q "committer email" /tmp/check-commit-authors-test.out || fail "missing committer email message"
echo "ok rejects wrong committer"

expect 0 run_check "$tmp" "$good" "$good"
echo "ok empty range"

echo "check-commit-authors tests passed"
