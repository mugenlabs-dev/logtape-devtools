import {
  createLogTapeDevtoolsPlugin,
  type LogTapeDevtoolsPluginOptions,
} from "./plugin/create-logtape-devtools-plugin";
import { createDevtoolsSink, type DevtoolsSinkOptions } from "./sink";
import { defaultLogStore, type LogStore } from "./store";

/** Options for {@link createLogTapeDevtools}. */
export interface CreateLogTapeDevtoolsOptions {
  /** Plugin options, minus `store` — the shared store is wired automatically. */
  plugin?: Omit<LogTapeDevtoolsPluginOptions, "store">;
  /** Sink options, minus `store` — the shared store is wired automatically. */
  sink?: Omit<DevtoolsSinkOptions, "store">;
  /** Store shared by the sink and the plugin. Defaults to the shared store. */
  store?: LogStore;
}

/**
 * Creates a LogTape sink and its matching TanStack DevTools plugin, both wired
 * to the same store.
 *
 * Use this instead of calling `createDevtoolsSink` and
 * `createLogTapeDevtoolsPlugin` separately when you do not need to hold on to
 * the store yourself.
 *
 * ```tsx
 * import { configure, getLogger } from "@logtape/logtape";
 * import { TanStackDevtools } from "@tanstack/react-devtools";
 * import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";
 *
 * const { sink, plugin } = createLogTapeDevtools();
 *
 * await configure({
 *   sinks: { devtools: sink },
 *   loggers: [{ category: [], lowestLevel: "trace", sinks: ["devtools"] }],
 * });
 *
 * function App() {
 *   return <TanStackDevtools plugins={[plugin]} />;
 * }
 * ```
 */
export function createLogTapeDevtools(options?: CreateLogTapeDevtoolsOptions) {
  const store = options?.store ?? defaultLogStore;

  return {
    plugin: createLogTapeDevtoolsPlugin({ ...options?.plugin, store }),
    sink: createDevtoolsSink({ ...options?.sink, store }),
  };
}
