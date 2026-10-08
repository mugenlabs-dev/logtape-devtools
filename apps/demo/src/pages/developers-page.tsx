import { Link } from "@tanstack/react-router";
import { GITHUB_REPO_URL, NPM_URL, ORG_NAME, SITE_NAME, SITE_URL } from "../content/site";
import { PackageName } from "../package-name";
import { ContentPage } from "./content-page";

export const DevelopersPage = () => (
  <ContentPage
    description={`Developer portal for ${SITE_NAME}: docs, playground, npm package, and agent entry points. There is no API-key console because this product is a local library, not a hosted API.`}
    title="Developers"
  >
    <p>
      Welcome to the {ORG_NAME} developer portal for {SITE_NAME}. Use this page as the hub when an
      agent or engineer needs predictable URLs for documentation, demos, and package metadata. The
      integration path is npm plus TypeScript — not OAuth client credentials against a remote API.
    </p>
    <h2>Documentation and API reference</h2>
    <ul>
      <li>
        <Link to="/docs">Library docs &amp; API reference</Link> — installation, quick start, and
        exported helpers
      </li>
      <li>
        <Link to="/">Homepage</Link> — same documentation with product overview
      </li>
      <li>
        <a href={`${SITE_URL}llms.txt`}>llms.txt</a> — when-to-use guidance for agents
      </li>
      <li>
        <a href={`${SITE_URL}index.md`}>index.md</a> — Markdown homepage body
      </li>
      <li>
        <a href={`${SITE_URL}openapi.json`}>openapi.json</a> — read-only site catalog description
      </li>
      <li>
        <a href={`${SITE_URL}api/v1/site`}>GET /api/v1/site</a> — public links JSON
      </li>
    </ul>
    <h2>Sandbox / playground</h2>
    <ul>
      <li>
        <Link to="/playground">Interactive playground</Link> — generate logs and inspect them in the
        DevTools panel
      </li>
    </ul>
    <h2>Package and source</h2>
    <ul>
      <li>
        <a href={NPM_URL} rel="noopener noreferrer" target="_blank">
          npm: <PackageName />
        </a>
      </li>
      <li>
        <a href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank">
          GitHub source and issues
        </a>
      </li>
    </ul>
    <h2>What you will not find here</h2>
    <p>
      There is no API key dashboard, no hosted log ingestion API, and no official CLI that wraps a
      remote backend. Inventing those surfaces would misrepresent the library. If you need
      programmatic control, import the documented package exports in your app’s development build.
    </p>
    <h2>Trust pages</h2>
    <ul>
      <li>
        <Link to="/about">About</Link>
      </li>
      <li>
        <Link to="/contact">Contact</Link>
      </li>
      <li>
        <Link to="/privacy">Privacy</Link>
      </li>
    </ul>
  </ContentPage>
);
