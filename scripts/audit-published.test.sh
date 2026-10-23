#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
fail() {
  echo "FAIL: $*" >&2
  exit 1
}

expect() {
  local want="$1"
  shift
  set +e
  "$@" >/tmp/audit-published-test.out 2>&1
  local got=$?
  set -e
  if [[ "${got}" -ne "${want}" ]]; then
    echo "command: $*" >&2
    cat /tmp/audit-published-test.out >&2
    fail "exit ${got}, want ${want}"
  fi
}

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT

# Workspace-only paths must not fail the published-package gate.
cat >"${tmp}/demo-only.json" <<'EOF'
{
  "actions": [
    {
      "action": "update",
      "module": "follow-redirects",
      "resolves": [
        {
          "id": 1242604,
          "path": "apps__demo>axios>follow-redirects",
          "dev": false
        }
      ]
    },
    {
      "action": "update",
      "module": "vite",
      "resolves": [
        {
          "id": 1242623,
          "path": "apps__demo>@tailwindcss/vite>vite",
          "dev": false
        }
      ]
    }
  ],
  "advisories": {
    "1242604": {
      "module_name": "follow-redirects",
      "severity": "high",
      "title": "follow-redirects demo-only",
      "url": "https://example.test/follow-redirects"
    },
    "1242623": {
      "module_name": "vite",
      "severity": "moderate",
      "title": "vite demo-only",
      "url": "https://example.test/vite"
    }
  }
}
EOF

expect 0 env AUDIT_JSON="${tmp}/demo-only.json" bash "${root}/audit-published.sh"

# A packages/core path must fail.
cat >"${tmp}/core-hit.json" <<'EOF'
{
  "actions": [
    {
      "action": "update",
      "module": "left-pad",
      "resolves": [
        {
          "id": 1,
          "path": "packages__core>@tanstack/pacer>left-pad",
          "dev": false
        }
      ]
    }
  ],
  "advisories": {
    "1": {
      "module_name": "left-pad",
      "severity": "high",
      "title": "core tree hit",
      "url": "https://example.test/left-pad"
    }
  }
}
EOF

expect 1 env AUDIT_JSON="${tmp}/core-hit.json" bash "${root}/audit-published.sh"
grep -q "packages__core>@tanstack/pacer>left-pad" /tmp/audit-published-test.out \
  || fail "expected core path in output"

# Empty actions/advisories with both keys present is clean.
cat >"${tmp}/clean.json" <<'EOF'
{ "actions": [], "advisories": {} }
EOF
expect 0 env AUDIT_JSON="${tmp}/clean.json" bash "${root}/audit-published.sh"

# Missing keys or an error field must fail closed.
cat >"${tmp}/missing-actions.json" <<'EOF'
{ "advisories": {} }
EOF
expect 1 env AUDIT_JSON="${tmp}/missing-actions.json" bash "${root}/audit-published.sh"

cat >"${tmp}/missing-advisories.json" <<'EOF'
{ "actions": [] }
EOF
expect 1 env AUDIT_JSON="${tmp}/missing-advisories.json" bash "${root}/audit-published.sh"

cat >"${tmp}/error-field.json" <<'EOF'
{ "error": "registry unavailable", "actions": [], "advisories": {} }
EOF
expect 1 env AUDIT_JSON="${tmp}/error-field.json" bash "${root}/audit-published.sh"
grep -q "failed closed" /tmp/audit-published-test.out \
  || fail "expected fail-closed message in output"

echo "audit-published tests passed"
