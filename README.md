# LogTape DevTools

A [TanStack DevTools](https://tanstack.com/devtools) plugin for inspecting [LogTape](https://logtape.org) logs in the browser.

Point a LogTape sink at the devtools store, mount the plugin, and your structured logs show up in a dedicated panel — filterable by level, searchable by category and message, expandable down to the properties of each record.

![The LogTape DevTools panel](./packages/core/assets/panel.png)

```tsx
import { configure } from "@logtape/logtape";
import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

const { sink, plugin } = createLogTapeDevtools();

await configure({
  sinks: { devtools: sink },
  loggers: [{ category: [], lowestLevel: "trace", sinks: ["devtools"] }],
});

const App = () => <TanStackDevtools plugins={[plugin]} />;
```

Full package documentation lives in [`packages/core/README.md`](./packages/core/README.md). A live demo and the same docs in browsable form are at [logtape-devtools.mugenlabs.dev](https://logtape-devtools.mugenlabs.dev).

## Layout

| Path | Contents |
| --- | --- |
| `packages/core` | The published package, [`@mugenlabs/logtape-devtools`](https://www.npmjs.com/package/@mugenlabs/logtape-devtools) — sink, store, and the React panel, plus its Storybook stories |
| `apps/demo` | The demo and documentation site (Vite + TanStack Router) deployed at logtape-devtools.mugenlabs.dev |
| `e2e` | Playwright specs driving the demo app against a real DevTools panel |

## Development

Requires Node >=18 and pnpm >=10.

```bash
pnpm install
pnpm build        # build the package
pnpm dev          # rebuild the package on change
pnpm dev:demo     # run the demo site on http://localhost:3001
```

Common checks:

```bash
pnpm typecheck        # build + tsgo across package and demo
pnpm test --run       # unit tests (Vitest)
pnpm test-storybook   # component tests via Storybook + Vitest browser mode
pnpm test:e2e         # Playwright end-to-end tests
pnpm lint:fix         # Biome check --write
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow, including the Changesets release process.

## License

[MIT](./LICENSE)
