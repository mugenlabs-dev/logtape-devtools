# @mugenlabs/logtape-devtools

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
