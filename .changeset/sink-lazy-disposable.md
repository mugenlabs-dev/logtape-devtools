---
"@mugenlabs/logtape-devtools": minor
---

Make the sink cheaper and disposable:

- `createDevtoolsSink` now returns a `DevtoolsSink` (`Sink & Disposable`). LogTape disposes sinks when its configuration is reset, and a disposed sink stops writing to its store.
- When the store has no capacity (`maxRecords: 0`) the sink skips normalisation entirely instead of cloning every record and then dropping it. `LogStore` gains an optional `getMaxRecords()` used for this check.
- `messageText` is rendered lazily on first access (search or display) instead of on every log call.
