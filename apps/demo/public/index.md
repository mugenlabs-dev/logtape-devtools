# LogTape DevTools

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

```bash
npm install -D @mugenlabs/logtape-devtools
```

Or install everything at once (including peer dependencies):

```bash
npm install -D @mugenlabs/logtape-devtools @logtape/logtape @tanstack/react-devtools
```

## Quick Start

Two steps: configure the sink, add the plugin.

### Configure the LogTape sink

```ts
import { configure } from "@logtape/logtape";
import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";

const { sink, plugin } = createLogTapeDevtools();

await configure({
  sinks: {
    devtools: sink,
  },
  loggers: [
    {
      category: [],
      lowestLevel: "trace",
      sinks: ["devtools"],
    },
  ],
});
```

### Add the DevTools plugin

```tsx
import { TanStackDevtools } from "@tanstack/react-devtools";

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[plugin]} />
    </>
  );
}
```

## API Reference

Exported functions and types: `createLogTapeDevtools`, `createDevtoolsSink`, `createLogTapeDevtoolsPlugin`, `createLogStore`.

### Compatibility

Requires `@logtape/logtape` `^2.0.0` and React 18 or 19. `@tanstack/react-devtools` `^0.9.0` is an optional peer dependency. Node 24 LTS or newer.

## Links

- [Docs](https://logtape-devtools.mugenlabs.dev/)
- [Playground](https://logtape-devtools.mugenlabs.dev/playground)
- [npm: @mugenlabs/logtape-devtools](https://www.npmjs.com/package/@mugenlabs/logtape-devtools)
- [Sitemap](https://logtape-devtools.mugenlabs.dev/sitemap.xml)
