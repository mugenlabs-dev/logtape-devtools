/**
 * Generate the OG image for the logtape-devtools demo site using Satori + React.
 *
 * Usage:
 *   npx tsx scripts/generate-og-image.tsx
 *
 * Output: apps/demo/public/og-image.png (1200x630)
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const W = 1200;
const H = 630;
const GRID_SIZE = 64;
const GRID_COLOR = "rgba(255, 255, 255, 0.04)";

const TITLE = "@mugenlabs/logtape-devtools";
const DESCRIPTION = [
  "A TanStack DevTools plugin for inspecting LogTape logs.",
  "Filter, search, and inspect structured logs in real time.",
];
const PILLS = [
  "Live Stream",
  "Level Filtering",
  "Category Search",
  "Structured Inspection",
  "Pause & Resume",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const GridLines = () => {
  const cols = Math.ceil(W / GRID_SIZE) + 1;
  const rows = Math.ceil(H / GRID_SIZE) + 1;

  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
      }}
    >
      {Array.from({ length: cols }, (_, i) => (
        <div
          key={`vcol-${String(i)}`}
          style={{
            position: "absolute",
            left: i * GRID_SIZE,
            top: 0,
            width: 1,
            height: H,
            backgroundColor: GRID_COLOR,
          }}
        />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={`hrow-${String(i)}`}
          style={{
            position: "absolute",
            top: i * GRID_SIZE,
            left: 0,
            width: W,
            height: 1,
            backgroundColor: GRID_COLOR,
          }}
        />
      ))}
    </div>
  );
};

const Pill = ({ label }: { label: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "8px 20px",
      borderRadius: 8,
      backgroundColor: "rgba(25, 22, 32, 0.8)",
      border: "1px solid rgba(70, 55, 100, 0.8)",
      fontSize: 15,
      color: "#c4b5fd",
    }}
  >
    {label}
  </div>
);

// ---------------------------------------------------------------------------
// Main OG Image component
// ---------------------------------------------------------------------------
const OgImage = ({ logoSrc }: { logoSrc: string }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: W,
      height: H,
      backgroundColor: "#0a0a0c",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Indigo radial glow (main) */}
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: -100,
        left: 200,
        width: 800,
        height: 600,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)",
      }}
    />

    {/* Secondary wider glow */}
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: -50,
        left: 0,
        width: 1200,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 60%)",
      }}
    />

    {/* Grid pattern */}
    <GridLines />

    {/* Content */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img alt="" height={120} src={logoSrc} style={{ borderRadius: 24 }} width={120} />

      <div
        style={{
          fontSize: 48,
          fontFamily: "sans-serif",
          fontWeight: 700,
          color: "#ffffff",
          marginTop: 28,
          letterSpacing: "-0.03em",
        }}
      >
        {TITLE}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 20,
          gap: 4,
        }}
      >
        {DESCRIPTION.map((line) => (
          <div key={line} style={{ fontSize: 20, color: "#888888" }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 60 }}>
        {PILLS.map((pill) => (
          <Pill key={pill} label={pill} />
        ))}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Font loading helper
// ---------------------------------------------------------------------------
async function loadFirstAvailable(paths: string[]): Promise<Buffer> {
  for (const p of paths) {
    try {
      return await readFile(p);
    } catch {
      // Font not found at this path, try next
    }
  }
  throw new Error(`No font found. Tried:\n${paths.join("\n")}`);
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------
async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const root = join(__dirname, "..");
  const logoPath = join(root, "apps", "demo", "public", "logo.png");
  const outPath = join(root, "apps", "demo", "public", "og-image.png");

  const logoBase64 = (await readFile(logoPath)).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  const svg = await satori(<OgImage logoSrc={logoSrc} />, {
    width: W,
    height: H,
    fonts: [
      {
        name: "monospace",
        data: await loadFirstAvailable([
          "/System/Library/Fonts/Supplemental/Andale Mono.ttf",
          "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
          "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        ]),
        weight: 700,
        style: "normal",
      },
      {
        name: "sans-serif",
        data: await loadFirstAvailable([
          "/System/Library/Fonts/Supplemental/Arial.ttf",
          "/System/Library/Fonts/Supplemental/Georgia.ttf",
          "/System/Library/Fonts/Geneva.ttf",
          "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]),
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
  });

  await writeFile(outPath, resvg.render().asPng());
  console.log(`Generated ${outPath} (${W}x${H})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
