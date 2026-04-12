import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
  },
  esbuildOptions(options) {
    options.alias = {
      "#": `${import.meta.dirname}/src`,
    };
  },
  external: ["react", "react-dom", "@logtape/logtape"],
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  sourcemap: true,
});
