import {
  createRootRoute,
  createRoute,
  HeadContent,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { ORG_NAME, PACKAGE_NAME, SITE_DESCRIPTION, SITE_NAME } from "./content/site";
import { Layout } from "./layout";
import { capturePageview } from "./lib/analytics";
import { AboutPage } from "./pages/about-page";
import { ContactPage } from "./pages/contact-page";
import { DevelopersPage } from "./pages/developers-page";
import { DocsPage } from "./pages/docs-page";
import { ErrorPage, NotFoundPage } from "./pages/error-page";
import { PlaygroundPage } from "./pages/playground-page";
import { PrivacyPage } from "./pages/privacy-page";

const Analytics = () => {
  const href = useLocation({ select: (location) => location.href });

  useEffect(() => {
    if (!href) {
      return;
    }
    capturePageview();
  }, [href]);

  return null;
};

const rootRoute = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Analytics />
      <Layout>
        <Outlet />
      </Layout>
    </>
  ),
  errorComponent: ErrorPage,
  head: () => ({ meta: [{ title: SITE_NAME }] }),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  component: DocsPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [{ title: `${SITE_NAME} — A TanStack DevTools plugin for LogTape` }],
  }),
  path: "/",
});

const docsRoute = createRoute({
  component: DocsPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [
      {
        content: `${SITE_DESCRIPTION} Documentation and API reference for ${PACKAGE_NAME}.`,
        name: "description",
      },
    ],
    title: `Docs · ${PACKAGE_NAME}`,
  }),
  path: "/docs",
});

const playgroundRoute = createRoute({
  component: PlaygroundPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [{ title: `Playground — ${SITE_NAME}` }, { content: "noindex", name: "robots" }],
  }),
  path: "/playground",
});

const developersRoute = createRoute({
  component: DevelopersPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [
      {
        content: `Developer portal for ${PACKAGE_NAME} — docs, playground, npm, and agent links from ${ORG_NAME}.`,
        name: "description",
      },
    ],
    title: `Developers · ${PACKAGE_NAME}`,
  }),
  path: "/developers",
});

const aboutRoute = createRoute({
  component: AboutPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [
      {
        content: `About ${PACKAGE_NAME} — the ${ORG_NAME} TanStack DevTools plugin for LogTape.`,
        name: "description",
      },
    ],
    title: `About · ${PACKAGE_NAME}`,
  }),
  path: "/about",
});

const contactRoute = createRoute({
  component: ContactPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [
      {
        content: `Contact ${SITE_NAME} via GitHub Issues.`,
        name: "description",
      },
    ],
    title: `Contact · ${PACKAGE_NAME}`,
  }),
  path: "/contact",
});

const privacyRoute = createRoute({
  component: PrivacyPage,
  getParentRoute: () => rootRoute,
  head: () => ({
    meta: [
      {
        content: `Privacy for ${SITE_NAME} — PostHog (EU) for page visits and errors; cookieless; npm library sends nothing to Mugenlabs.`,
        name: "description",
      },
    ],
    title: `Privacy · ${PACKAGE_NAME}`,
  }),
  path: "/privacy",
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  docsRoute,
  playgroundRoute,
  developersRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
]);
