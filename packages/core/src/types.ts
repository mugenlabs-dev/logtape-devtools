export type LogLevel = "trace" | "debug" | "info" | "warning" | "error" | "fatal";

export const LOG_LEVELS: LogLevel[] = ["trace", "debug", "info", "warning", "error", "fatal"];

export interface DevtoolsLogRecord {
  /** Source location of the log call (only present when `experimentalCaptureStackTrace` is enabled). */
  caller?: string;
  category: string[];
  id: string;
  level: LogLevel;
  message: unknown[];
  messageText: string;
  properties: Record<string, unknown>;
  timestamp: number;
}
