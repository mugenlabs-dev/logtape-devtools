import { GITHUB_REPO_URL, NPM_URL, ORG_NAME, PACKAGE_NAME, SITE_NAME } from "../content/site";
import { ContentPage } from "./content-page";

export const AboutPage = () => (
  <ContentPage
    description={`${SITE_NAME} is an open-source TanStack DevTools plugin from ${ORG_NAME} for inspecting LogTape logs in the browser.`}
    title="About"
  >
    <p>
      {ORG_NAME} publishes {SITE_NAME} as the npm package{" "}
      <a href={NPM_URL} rel="noopener noreferrer" target="_blank">
        {PACKAGE_NAME}
      </a>
      . The package connects a LogTape sink to an in-memory store and a TanStack DevTools panel so
      you can filter by level, search by category and message, expand structured properties, pause
      the live stream, and keep a bounded buffer — without leaving the browser during local
      development.
    </p>
    <h2>What this project is</h2>
    <p>
      This site documents and demos the library. The product surface is a TypeScript package and
      React DevTools plugin, not a multi-tenant cloud logging service. There is no login, no hosted
      log backend, no public product CLI, and no remote REST or GraphQL API for ingesting or
      querying your application logs. Source of truth for the code lives on{" "}
      <a href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank">
        GitHub under mugenlabs-dev/logtape-devtools
      </a>
      , licensed MIT.
    </p>
    <h2>Who it is for</h2>
    <p>
      JavaScript and TypeScript developers who already use (or will use){" "}
      <a href="https://logtape.org" rel="noopener noreferrer" target="_blank">
        LogTape
      </a>{" "}
      and want a dedicated panel inside{" "}
      <a href="https://tanstack.com/devtools" rel="noopener noreferrer" target="_blank">
        TanStack DevTools
      </a>
      . Agents and humans should treat the docs, playground, and npm package as the integration path
      — not invent hosted OpenAPI services or CLIs that do not exist.
    </p>
    <h2>Organization</h2>
    <p>
      {ORG_NAME} maintains this project. For releases, contributions, and issue tracking, use the
      GitHub repository linked above.
    </p>
  </ContentPage>
);
