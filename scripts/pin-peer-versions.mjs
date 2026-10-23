// Pins the library's peer dependencies to the oldest or the newest version
// their ranges allow, so CI can test both ends of the support window. Writes
// pnpm overrides into the root package.json; run
// `pnpm install --no-frozen-lockfile` afterwards.
//
// Usage: node scripts/pin-peer-versions.mjs <oldest|latest>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [, , mode] = process.argv;
if (mode !== "oldest" && mode !== "latest") {
  console.error("Usage: node scripts/pin-peer-versions.mjs <oldest|latest>");
  process.exit(1);
}

const rootUrl = new URL("../package.json", import.meta.url);
const corePath = new URL("../packages/core/package.json", import.meta.url);
const root = JSON.parse(readFileSync(rootUrl, "utf8"));
const { peerDependencies } = JSON.parse(readFileSync(corePath, "utf8"));

const compare = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/** The newest published version that satisfies `range`. */
const newestPublished = (name, range) => {
  const output = execFileSync("npm", ["view", `${name}@${range}`, "version", "--json"], {
    encoding: "utf8",
  });
  const versions = [JSON.parse(output)].flat().filter((v) => !v.includes("-"));
  return versions.sort(compare).at(-1);
};

// "^18.0.0 || ^19.0.0": oldest is 18.0.0, latest is the newest published 19.x.
const pick = (name, range) => {
  const bounds = range.match(/\d+\.\d+\.\d+/g);
  if (!bounds) {
    throw new Error(`Cannot read a version from the ${name} peer range "${range}"`);
  }
  bounds.sort(compare);
  return mode === "oldest" ? bounds[0] : newestPublished(name, `^${bounds.at(-1)}`);
};

const overrides = Object.fromEntries(
  Object.entries(peerDependencies).map(([name, range]) => [name, pick(name, range)])
);
// The tests render with react-dom, so it has to match react even where it
// isn't a peer.
if (overrides.react) {
  overrides["react-dom"] = overrides.react;
}

root.pnpm.overrides = { ...root.pnpm.overrides, ...overrides };
writeFileSync(rootUrl, `${JSON.stringify(root, null, 2)}\n`);

for (const [name, version] of Object.entries(overrides)) {
  console.log(`${name}: ${version}`);
}
