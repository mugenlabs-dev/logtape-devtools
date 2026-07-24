/** Severity levels supported by LogTape, ordered from least to most severe. */
export type LogLevel = "trace" | "debug" | "info" | "warning" | "error" | "fatal";

/** Every {@link LogLevel}, ordered from least to most severe. */
export const LOG_LEVELS: LogLevel[] = ["trace", "debug", "info", "warning", "error", "fatal"];

/** A LogTape record normalized for display in the devtools panel. */
export interface DevtoolsLogRecord {
  /** Source location of the log call (only present when `captureStackTrace` is enabled). */
  caller?: string;
  /** Logger category path, e.g. `["app", "auth"]`. */
  category: string[];
  /** Unique identifier, stable for the lifetime of the record. */
  id: string;
  /** Severity of the record. */
  level: LogLevel;
  /** Raw message parts, alternating literals and interpolated values. */
  message: unknown[];
  /** Message parts rendered into a single searchable string. */
  messageText: string;
  /** Structured properties attached to the log call, deep-cloned for safety. */
  properties: Record<string, unknown>;
  /** Creation time in milliseconds since the Unix epoch. */
  timestamp: number;
}
