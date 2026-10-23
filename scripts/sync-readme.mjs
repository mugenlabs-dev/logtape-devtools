#!/usr/bin/env node
/**
 * Generate the npm README (packages/core/README.md) from the root README.md,
 * so the two cannot drift apart. Relative links are made absolute, because
 * npm renders the README outside the repository, and the contributor-only
 * "Development" section is left out.
 *
 * Usage: node scripts/sync-readme.mjs [--check]
 * --check exits with 1 when packages/core/README.md is out of date.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "README.md");
const target = join(root, "packages/core/README.md");

const REPO = "mugenlabs-dev/logtape-devtools";
const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;
const BLOB = `https://github.com/${REPO}/blob/main/`;

const isRelative = (url) => !/^(?:[a-z]+:|#|\/\/)/i.test(url);

/** Images are served raw so npm can display them; other files link to GitHub. */
const absolute = (url) => (/\.(?:svg|png|jpe?g|gif|webp)$/i.test(url) ? RAW : BLOB) + url;

const readme = readFileSync(source, "utf8");

const development = readme.indexOf("\n## Development\n");
const nextSection = readme.indexOf("\n## ", development + 1);
if (development === -1 || nextSection === -1) {
  console.error("sync-readme: could not find the Development section and the one after it.");
  process.exit(1);
}

const generated = [
  "<!-- Generated from the root README.md by scripts/sync-readme.mjs. Edit that file instead. -->",
  "",
  (readme.slice(0, development) + readme.slice(nextSection))
    .replaceAll(/src="([^"]+)"/g, (match, url) =>
      isRelative(url) ? `src="${absolute(url)}"` : match
    )
    .replaceAll(/\]\(([^)\s]+)\)/g, (match, url) =>
      isRelative(url) ? `](${absolute(url)})` : match
    ),
].join("\n");

if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== generated) {
    console.error("packages/core/README.md is out of date. Run `pnpm readme:sync`.");
    process.exit(1);
  }
  console.log("packages/core/README.md is up to date.");
} else {
  writeFileSync(target, generated);
  console.log("Wrote packages/core/README.md");
}
