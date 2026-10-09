import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  define: {
    "import.meta.env.VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV ?? ""),
  },
  plugins: [tailwindcss(), react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    headers: {
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
    port: 3001,
    proxy: {
      "/ingest": {
        changeOrigin: true,
        rewrite: (path) =>
          path.startsWith("/ingest/static")
            ? path.replace(/^\/ingest\/static/, "/static")
            : path.replace(/^\/ingest/, ""),
        router: (req) =>
          req.url?.includes("/ingest/static")
            ? "https://eu-assets.i.posthog.com"
            : "https://eu.i.posthog.com",
        target: "https://eu.i.posthog.com",
      },
    },
  },
});
