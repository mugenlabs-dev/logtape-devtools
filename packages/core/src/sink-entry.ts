/**
 * React-free entry point: `@mugenlabs/logtape-devtools/sink`.
 *
 * Import from here in code that configures LogTape but must not pull React into
 * the bundle (server entry points, workers, shared logging setup…). The panel
 * itself keeps importing from the package root.
 */

// --- Sink ---
export type { DevtoolsSinkOptions } from "./sink";
export { createDevtoolsSink } from "./sink";

// --- Store ---
export type { LogStore, LogStoreOptions } from "./store";
export { createLogStore, defaultLogStore } from "./store";

// --- Types ---
export type { DevtoolsLogRecord, LogLevel } from "./types";
export { LOG_LEVELS } from "./types";
