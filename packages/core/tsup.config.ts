import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    sink: "src/sink-entry.ts",
  },
  esbuildOptions(options) {
    options.alias = {
      "#": `${import.meta.dirname}/src`,
    };
  },
  external: ["react", "react-dom", "@logtape/logtape"],
  format: ["esm"],
  minify: true,
  outExtension: () => ({ js: ".mjs" }),
  plugins: [
    {
      // Mark the React entry as a client module for React Server Components.
      // Only that file: `/sink` and the chunk it shares with the root (which
      // holds `defaultLogStore`) must stay importable from server code.
      name: "use-client-banner",
      renderChunk(code, chunk) {
        return chunk.path.endsWith("/index.mjs") ? { code: `"use client";\n${code}` } : undefined;
      },
    },
  ],
  sourcemap: false,
});
