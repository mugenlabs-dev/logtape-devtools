import { createRootRoute, createRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { Layout } from "./layout";
import { DocsPage } from "./pages/docs-page";
import { ErrorPage, NotFoundPage } from "./pages/error-page";
import { PlaygroundPage } from "./pages/playground-page";

const SITE_TITLE = "LogTape DevTools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Layout>
        <Outlet />
      </Layout>
    </>
  ),
  errorComponent: ErrorPage,
  head: () => ({ meta: [{ title: SITE_TITLE }] }),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  component: DocsPage,
  getParentRoute: () => rootRoute,
  head: () => ({ meta: [{ title: `${SITE_TITLE} — A TanStack DevTools plugin for LogTape` }] }),
  path: "/",
});

const playgroundRoute = createRoute({
  component: PlaygroundPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [{ title: `Playground — ${SITE_TITLE}` }, { content: "noindex", name: "robots" }],
  }),
  path: "/playground",
});

export const routeTree = rootRoute.addChildren([indexRoute, playgroundRoute]);
