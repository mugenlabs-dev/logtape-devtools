# @mugenlabs/logtape-devtools

A [TanStack DevTools](https://tanstack.com/devtools) plugin for inspecting [LogTape](https://logtape.org) logs in the browser.

Filter, search, and inspect structured logs in real time — without leaving the browser DevTools overlay.

## Features

- **Live log streaming** — see logs as they happen
- **Level filtering** — toggle trace, debug, info, warning, error, fatal
- **Category search** — filter by logger category
- **Structured inspection** — expand logs to view properties and stack traces
- **Pause & resume** — freeze the log stream to inspect entries

## Installation

```bash
pnpm add @mugenlabs/logtape-devtools @logtape/logtape @tanstack/react-devtools
```

## Quick Start

### 1. Configure the LogTape sink

```ts
import { configure } from "@logtape/logtape";
import { createDevtoolsSink } from "@mugenlabs/logtape-devtools";

await configure({
  sinks: { devtools: createDevtoolsSink() },
  loggers: [{ category: ["app"], sinks: ["devtools"], lowestLevel: "debug" }],
});
```

### 2. Add the DevTools plugin

```tsx
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";

const logtapePlugin = createLogTapeDevtoolsPlugin();

function App() {
  return (
    <>
      {/* your app */}
      <TanStackDevtools plugins={[logtapePlugin]} />
    </>
  );
}
```

## API

### `createDevtoolsSink(options?)`

Creates a LogTape sink that forwards log records to the devtools store.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `store` | `LogStore` | `defaultLogStore` | Custom log store instance |
| `captureStackTrace` | `boolean` | `true` (dev only) | Capture stack traces |
| `stackTraceDepth` | `number` | `20` | Max stack trace frames |

### `createLogTapeDevtoolsPlugin(options?)`

Creates the TanStack DevTools plugin component.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `store` | `LogStore` | `defaultLogStore` | Custom log store instance |

### `createLogStore(options?)`

Creates a standalone log store for advanced use cases.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `maxRecords` | `number` | `1000` | Maximum records to retain |

## Demo

See the live demo and full documentation at [yagogc.github.io/logtape-devtools](https://yagogc.github.io/logtape-devtools/).

## License

MIT
