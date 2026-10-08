# LogTape DevTools

A TanStack DevTools plugin that brings your LogTape logs into a dedicated, filterable panel. See everything your app is logging without leaving DevTools — built by Mugenlabs and published on npm as `@mugenlabs/logtape-devtools`.

## When to use this library

Use `@mugenlabs/logtape-devtools` when you already log with LogTape in a JavaScript/TypeScript app and want a DevTools panel for level filters, category search, structured property inspection, pause/resume, and a bounded memory buffer during local development.

Do not expect a hosted REST API, remote log ingestion service, or official CLI that talks to a backend. There is no hosted API and no CLI. Integration is local: install the package, configure the sink, mount the plugin.

## Start here

- [Full documentation](https://logtape-devtools.mugenlabs.dev/docs) — installation, quick start, API reference
- [Developer portal](https://logtape-devtools.mugenlabs.dev/developers) — links for agents and humans
- [Playground](https://logtape-devtools.mugenlabs.dev/playground) — live demo
- [npm](https://www.npmjs.com/package/@mugenlabs/logtape-devtools)
- [GitHub](https://github.com/mugenlabs-dev/logtape-devtools)
- [llms.txt](https://logtape-devtools.mugenlabs.dev/llms.txt)
- [Site catalog](https://logtape-devtools.mugenlabs.dev/api/v1/site)

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

## Install

```bash
npm install -D @mugenlabs/logtape-devtools
```

Peer dependencies include `@logtape/logtape`. Host the panel with `@tanstack/react-devtools` when you want the visual UI. For React-free configuration, import from `@mugenlabs/logtape-devtools/sink`.

## Trust and contact

- [About](https://logtape-devtools.mugenlabs.dev/about)
- [Contact — GitHub Issues only](https://github.com/mugenlabs-dev/logtape-devtools/issues)
- [Privacy](https://logtape-devtools.mugenlabs.dev/privacy)
