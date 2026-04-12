import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { routeTree } from "./router";
import "./styles.css";
import { ThemeProvider } from "./theme-context";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// biome-ignore lint/style/noNonNullAssertion: root element always exists
createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);
