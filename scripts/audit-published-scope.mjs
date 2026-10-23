#!/usr/bin/env node
/**
 * Fail only when pnpm audit resolve paths belong to packages/core.
 *
 * pnpm audit has no package filter. In a workspace, `pnpm --dir packages/core
 * audit` still reads the root lockfile and reports every importer (including
 * apps/demo). Scope by path prefix instead.
 */
import { readFileSync } from "node:fs";

const PUBLISHED_PREFIX = "packages__core";

const [, , file] = process.argv;
if (!file) {
  console.error("usage: audit-published-scope.mjs <audit.json>");
  process.exit(2);
}

const report = JSON.parse(readFileSync(file, "utf8"));

// Fail closed: a registry/pnpm failure must not look like a clean audit.
if ("error" in report || !("actions" in report) || !("advisories" in report)) {
  console.error(
    "Published package audit failed closed: report is missing actions/advisories or has an error field."
  );
  if ("error" in report) {
    console.error(typeof report.error === "string" ? report.error : JSON.stringify(report.error));
  }
  process.exit(1);
}

const { actions, advisories } = report;

const hits = [];
for (const action of actions) {
  for (const resolve of action.resolves ?? []) {
    const path = resolve.path ?? "";
    if (!path.startsWith(PUBLISHED_PREFIX)) {
      continue;
    }
    const advisory = advisories[String(resolve.id)];
    hits.push({
      id: resolve.id,
      module: advisory?.module_name ?? action.module ?? "(unknown)",
      path,
      severity: advisory?.severity ?? "(unknown)",
      title: advisory?.title ?? "",
      url: advisory?.url ?? "",
    });
  }
}

const workspaceOnly = actions.flatMap((action) =>
  (action.resolves ?? [])
    .map((resolve) => resolve.path ?? "")
    .filter((path) => path && !path.startsWith(PUBLISHED_PREFIX))
);

if (hits.length === 0) {
  const ignored = new Set(workspaceOnly).size;
  if (ignored > 0) {
    console.log(
      `Published package audit clean. Ignored ${ignored} workspace-only path(s) (not in packages/core).`
    );
  } else {
    console.log("Published package audit clean.");
  }
  process.exit(0);
}

console.error("Vulnerabilities in the published package production tree:");
for (const hit of hits) {
  console.error(
    `- ${hit.severity} ${hit.module} via ${hit.path}${hit.title ? `: ${hit.title}` : ""}${hit.url ? ` (${hit.url})` : ""}`
  );
}
process.exit(1);
