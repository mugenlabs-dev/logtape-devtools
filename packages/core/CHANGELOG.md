# @mugenlabs/logtape-devtools

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
