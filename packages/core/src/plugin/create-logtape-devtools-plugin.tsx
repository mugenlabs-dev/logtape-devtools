import { defaultLogStore, type LogStore } from "../store";
import { LogTapeDevtoolsPlugin } from "./logtape-devtools-plugin";

export interface LogTapeDevtoolsPluginOptions {
  /** Whether to open the devtools panel by default. Default: true */
  defaultOpen?: boolean;
  /** Plugin display name. Default: "LogTape" */
  name?: string;
  /** Custom log store instance. Must match the store passed to createDevtoolsSink. */
  store?: LogStore;
}

/**
 * Creates a TanStack DevTools plugin config object for LogTape.
 *
 * Usage:
 * ```tsx
 * import { TanStackDevtools } from "@tanstack/react-devtools";
 * import { createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";
 *
 * <TanStackDevtools plugins={[createLogTapeDevtoolsPlugin()]} />
 * ```
 */
export const createLogTapeDevtoolsPlugin = (options?: LogTapeDevtoolsPluginOptions) => ({
  defaultOpen: options?.defaultOpen ?? true,
  id: "logtape-devtools-plugin",
  name: options?.name ?? "LogTape",
  render: <LogTapeDevtoolsPlugin store={options?.store ?? defaultLogStore} />,
});
