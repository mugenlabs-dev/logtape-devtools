#!/usr/bin/env bash
# Blocking audit for the published package (@mugenlabs/logtape-devtools).
# pnpm audit has no --filter; --dir does not limit a workspace audit.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "${root}"

tmp="$(mktemp)"
trap 'rm -f "${tmp}"' EXIT

if [[ -n "${AUDIT_JSON:-}" ]]; then
  cp "${AUDIT_JSON}" "${tmp}"
else
  # pnpm exits 1 when the workspace has vulns; JSON is still written.
  set +e
  pnpm audit --prod --audit-level=moderate --json >"${tmp}" 2>/dev/null
  set -e
fi

node "${root}/scripts/audit-published-scope.mjs" "${tmp}"
