# @mugenlabs/logtape-devtools

## 0.4.4

### Patch Changes

- 898dcb0: - Interpolated message values are now copied when they are logged, like properties already were. Changing an object after logging it no longer changes what the panel shows, and the store no longer keeps large objects such as DOM nodes alive.
  - The copy has size limits: nesting deeper than 8 levels, entries past the first 100 of an object, array, Map or Set, strings past 10,000 characters, and anything past 5,000 values per record become `[Truncated: …]` markers. A single huge payload can no longer cost its full size for every buffered record.
  - The copy keeps `Date`, `Map`, `Set`, `RegExp` and `Error` values, including an error's custom fields such as `code` and `AggregateError.errors`. Objects with a `toJSON` method are stored as what `toJSON` returns, so values that keep their data in private fields still show up. `toJSON` now runs when the value is logged rather than when the panel first displays it. Functions, DOM nodes and binary data become short descriptions such as `[HTMLButtonElement]`.

## 0.4.3

### Patch Changes

- 2b542d1: - Stack capture now really turns off in production browser builds. The `NODE_ENV` check was written so that Vite and webpack could not replace it, so it was always false in the browser and every log paid for a stack trace. If you rely on `caller` in a production build, set `forceStackTrace: true`.
  - Logs that arrive while the panel is paused keep their `caller`. Pausing used to unsubscribe the panel, so the sink stopped capturing stacks until Resume.
  - Server rendering shows an empty panel instead of reading the process-wide store, which on a server can hold other requests' logs. The client fills the panel in after hydration.
  - Selected category filters stay visible after Clear, or once their records are evicted, so they can still be removed. Before, the chips disappeared but the filter kept hiding new logs.

## 0.4.2

### Patch Changes

- 4c63c13: - Pausing the panel unsubscribes from the store so hot loggers no longer re-render the plugin/toolbar/virtualizer until Resume.
  - Filter/search uses precomputed `categoryKey` and lazy `messageSearchText` (optional fields; fixtures without them still work).
  - Update `@tanstack/pacer` to `^0.22.0`; published build is minified without sourcemaps (ESM + dts only).

## 0.4.1

### Patch Changes

- 234395c: - Unknown log levels no longer crash the expanded detail pane (same `getLevelColors` fallback already used by rows and badges).
  - Optional peers are now caret-bounded (`@logtape/logtape` `^2.0.0`, `@tanstack/react-devtools` `^0.9.0`) so a LogTape 3 or DevTools 0.10 plugin-prop change cannot be pulled in automatically. 0.10 changed how props are passed into plugins.
  - The published package now declares `engines.node` `>=24.0.0` (Node 24 Active LTS).

## 0.4.0

### Minor Changes

- 62a2815: Make the sink cheaper and disposable:

  - `createDevtoolsSink` now returns a `DevtoolsSink` (`Sink & Disposable`). LogTape disposes sinks when its configuration is reset, and a disposed sink stops writing to its store.
  - When the store has no capacity (`maxRecords: 0`) the sink skips normalisation entirely instead of cloning every record and then dropping it. `LogStore` gains an optional `getMaxRecords()` used for this check.
  - `messageText` is rendered lazily on first access (search or display) instead of on every log call.

- 2491681: - `createLogTapeDevtoolsPlugin` now returns `TanStackDevtoolsReactPlugin` from `@tanstack/react-devtools`, so a change in the host plugin shape is caught by this package's typecheck rather than in consumer apps.
  - `@logtape/logtape` is now an optional peer dependency: the package only imports its types, so store-only consumers no longer need it installed.
  - The published package now includes its LICENSE file.

### Patch Changes

- 1245534: Darken the debug and info level badges so their white text meets the 4.5:1 WCAG contrast ratio.
- 948966e: Keep auto-following new logs once the store has reached `maxRecords`. Previously the panel stopped scrolling to new entries after the buffer filled up, because the record count no longer changed.
- c43da4e: Fix two log list edge cases: a render crash when the list shrinks (after Clear or a narrowing filter) while the virtualizer still holds keys for old indices, and auto-follow staying off after Clear if the user had scrolled up before.
- d08ce35: Normalise `maxRecords` to a non-negative integer. A fractional value no longer disables the capacity limit, and `NaN` or a negative value no longer leaves the store silently dropping every record.
- 9987a58: Pin `@base-ui-components/react` to the exact release candidate the plugin is tested against, instead of a caret range that could resolve to a newer, incompatible release candidate.
- c54c8a5: Render Error objects, Maps, Sets, BigInts, symbols and functions readably in the Data pane instead of showing `{}` or collapsing the whole properties object to `[object Object]`. Circular references are still marked `[Circular]`, but shared non-circular references are no longer mislabelled.
- 783a3b0: Render records with a log level this version does not know about (possible with newer LogTape releases) using the "info" colours and the raw level as the badge label, instead of crashing the panel.
- 08ab494: Accessibility and rendering fixes in the panel: keyboard focus is visible again on toolbar controls and inputs, the search and category inputs have accessible names, level toggles only report `aria-pressed` for levels the user actually selected, log rows are memoised, and the time formatter is built once instead of per row.

## 0.3.0

### Minor Changes

- e3d8dd2: New `createLogTapeDevtools()` factory, a React-free `/sink` entry point, and a much faster log pipeline.

  **Breaking changes**

  - `DevtoolsSinkOptions.experimentalCaptureStackTrace` is now `captureStackTrace`. Behaviour and the `true`-in-dev default are unchanged; the option is still marked `@experimental` in its JSDoc. `forceStackTrace` is unchanged.
  - `createLogStore(maxSize?)` now takes an options object: `createLogStore({ maxRecords: 5000 })`. The default is still 1000 records.
  - `LogTapeDevtoolsPlugin` (the raw React component) is no longer exported. Use `createLogTapeDevtoolsPlugin()` or the new `createLogTapeDevtools()` instead.
  - `LogStore` implementations must now provide `hasListeners(): boolean`. Custom stores need to add it.

  **New**

  - `createLogTapeDevtools(options?)` returns `{ sink, plugin }` pre-wired to a single store, so the common setup is one call:

    ```ts
    const { sink, plugin } = createLogTapeDevtools();
    ```

  - `@mugenlabs/logtape-devtools/sink` subpath export ships `createDevtoolsSink`, `createLogStore`, `defaultLogStore` and the types with no React in the bundle — import from it in server entry points, workers, or shared logging setup.

  **Performance**

  - Store notifications are batched: a synchronous burst of log calls now triggers a single re-render instead of one per record.
  - Records are held in a ring buffer, so appending is O(1) instead of copying the whole array per record; the snapshot array is rebuilt at most once per change.
  - The log list is virtualized, so panels with thousands of records only render the visible rows.
  - Stack trace capture is skipped entirely while no devtools panel is mounted (unless `forceStackTrace` is set), removing the per-log `new Error().stack` cost from apps in normal use.
  - Log properties are cloned with `structuredClone` when available, falling back to the previous JSON-based path.

## 0.2.1

### Patch Changes

- a49d3e4: Scope log ID generation per sink instance to prevent ID collisions when multiple sinks share a store, and cancel the toolbar search debouncer on unmount

## 0.2.0

### Minor Changes

- 7c08a91: initial release

### Patch Changes

- 7df60ce: update icons
- dfc19be: Fix release process
- ed92394: Fix
