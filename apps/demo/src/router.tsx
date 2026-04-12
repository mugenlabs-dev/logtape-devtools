import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { Layout } from "./layout";
import { DocsPage } from "./pages/docs-page";
import { ErrorPage } from "./pages/error-page";
import { PlaygroundPage } from "./pages/playground-page";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
  errorComponent: ErrorPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DocsPage,
});

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playground",
  component: PlaygroundPage,
});

export const routeTree = rootRoute.addChildren([indexRoute, playgroundRoute]);
