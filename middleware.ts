import { next } from "@vercel/functions";

/**
 * Demo-site agent plumbing: Markdown negotiation + real HTTP 404s.
 * Homepage Markdown is derived strictly from existing visible page copy
 * (apps/demo/src/pages/docs-page.tsx, features-section.tsx, error-page.tsx).
 */

export const config = {
  matcher: ["/", "/((?!assets/|.*\\..*).*)"],
};

const KNOWN_HTML_ROUTES = new Set(["/", "/playground"]);

/** Derived from DocsPage hero + FeaturesSection + section titles/body. */
const HOMEPAGE_MARKDOWN = `# LogTape DevTools

A TanStack DevTools plugin that brings your LogTape logs into a dedicated, filterable panel. See everything your app is logging without leaving DevTools.

Built for [LogTape](https://logtape.org) & [TanStack DevTools](https://tanstack.com/devtools).

## Features

### Live Log Stream

Watch logs appear in real time as your application runs. No more switching between browser console and your app.

### Level Filtering

Filter logs by severity level — trace, debug, info, warning, error, fatal. Focus on what matters.

### Category Search

Filter by category prefix and search across log messages. Find the needle in the haystack.

### Structured Inspection

Click any log entry to expand and inspect the full payload, including structured properties and metadata.

### Pause & Resume

Pause the live stream to inspect logs without them scrolling away. Resume when you're ready.

### Bounded Memory

A configurable buffer keeps memory usage under control. Old logs are dropped automatically.

## Installation

Add to your project as a dev dependency.

Install logtape-devtools:

\`\`\`bash
npm install -D @mugenlabs/logtape-devtools
\`\`\`

Or install everything at once (including peer dependencies):

\`\`\`bash
npm install -D @mugenlabs/logtape-devtools @logtape/logtape @tanstack/react-devtools
\`\`\`

## Quick Start

Two steps: configure the sink, add the plugin.

### Configure the LogTape sink

\`\`\`ts
import { configure } from "@logtape/logtape";
import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";

// One call returns a sink and a panel plugin
// already wired to the same store.
const { sink, plugin } = createLogTapeDevtools();

await configure({
  sinks: {
    devtools: sink,
  },
  loggers: [
    {
      category: [],          // [] = match all categories
      lowestLevel: "trace",  // capture every level
      sinks: ["devtools"],
    },
  ],
});
\`\`\`

### Add the DevTools plugin

\`\`\`tsx
import { TanStackDevtools } from "@tanstack/react-devtools";

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[plugin]} />
    </>
  );
}
\`\`\`

## Advanced Setup

Hold on to the store yourself, or keep React out of your logging setup.

\`createLogTapeDevtools()\` is a thin wrapper over \`createDevtoolsSink\` and \`createLogTapeDevtoolsPlugin\`. Call them separately when you need a reference to the store — for a custom buffer size, isolated stores in tests, or clearing logs programmatically.

The package root pulls in React, since the panel is a React component. If your LogTape configuration is shared with a server entry point, a worker, or any non-React bundle, import from the \`@mugenlabs/logtape-devtools/sink\` subpath instead — it exports the sink, the store and the types with no React dependency.

## Production

Keep the panel out of your production bundle.

The panel is a development tool. Guard the mount behind a build-time flag so your bundler can tree-shake it — and \`@tanstack/react-devtools\` along with it — out of production builds.

## API Reference

Exported functions and types: \`createLogTapeDevtools\`, \`createDevtoolsSink\`, \`createLogTapeDevtoolsPlugin\`, \`createLogStore\`.

### Compatibility

Requires \`@logtape/logtape\` \`^2.0.0\` and React 18 or 19. \`@tanstack/react-devtools\` \`^0.9.0\` is an optional peer dependency — you only need it to host the panel, so you can depend on this package purely for the sink via the \`/sink\` subpath. Node 24 LTS or newer.

## Links

- [Try Playground](/playground)
- [npm: @mugenlabs/logtape-devtools](https://www.npmjs.com/package/@mugenlabs/logtape-devtools)
- [Sitemap](/sitemap.xml)
`;

/** Derived from NotFoundPage copy + discovery links. */
const NOT_FOUND_MARKDOWN = `# Page not found

There is nothing at this address.

[Back to the docs](/)

Also see [sitemap.xml](/sitemap.xml).
`;

const NOT_FOUND_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page not found — LogTape DevTools</title>
    <meta name="robots" content="noindex">
  </head>
  <body>
    <main>
      <h1>Page not found</h1>
      <p>There is nothing at this address.</p>
      <p><a href="/">Back to the docs</a></p>
    </main>
  </body>
</html>
`;

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

/**
 * Prefer Markdown only when Accept explicitly includes text/markdown
 * with a quality at least as high as text/html (acceptmarkdown.com).
 */
function prefersMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) {
    return false;
  }

  const parts = acceptHeader.split(",").map((part) => part.trim());
  let markdownQ = Number.NaN;
  let htmlQ = Number.NaN;

  for (const part of parts) {
    const [media, ...params] = part.split(";").map((p) => p.trim());
    let q = 1;
    for (const param of params) {
      const match = /^q=([0-9.]+)$/i.exec(param);
      if (match) {
        q = Number(match[1]);
      }
    }
    if (media === "text/markdown") {
      markdownQ = q;
    } else if (media === "text/html") {
      htmlQ = q;
    }
  }

  if (Number.isNaN(markdownQ) || markdownQ <= 0) {
    return false;
  }
  if (Number.isNaN(htmlQ)) {
    return true;
  }
  return markdownQ >= htmlQ;
}

function markdownResponse(body: string, status = 200): Response {
  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
    },
    status,
  });
}

export default function middleware(request: Request): Response | ReturnType<typeof next> {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  const wantsMarkdown = prefersMarkdown(request.headers.get("accept"));
  const isKnown = KNOWN_HTML_ROUTES.has(path);

  if (!isKnown) {
    if (wantsMarkdown) {
      return markdownResponse(NOT_FOUND_MARKDOWN, 404);
    }
    return new Response(NOT_FOUND_HTML, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Type": "text/html; charset=utf-8",
        Vary: "Accept",
      },
      status: 404,
    });
  }

  if (wantsMarkdown) {
    if (path === "/") {
      return markdownResponse(HOMEPAGE_MARKDOWN);
    }
    // Playground: derived from playground-page.tsx heading + lead sentence.
    return markdownResponse(
      "# Playground\n\nGenerate logs to see them appear in the LogTape DevTools panel below.\n\n[Back to the docs](/)\n"
    );
  }

  return next({
    headers: {
      Vary: "Accept",
    },
  });
}
