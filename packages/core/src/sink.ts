import type { LogRecord, Sink } from "@logtape/logtape";
import { safeCloneProperties, safeStringify } from "./safe-json";
import { defaultLogStore, type LogStore } from "./store";
import type { DevtoolsLogRecord, LogLevel } from "./types";

function renderMessage(message: readonly unknown[]): string {
  return message
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (part === null || part === undefined) {
        return String(part);
      }
      return safeStringify(part);
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Stack trace parser — extracts the caller frame from `new Error().stack`
// ---------------------------------------------------------------------------

// V8 (Chrome/Node/Edge): "    at functionName (file:line:col)"
const v8FrameRe = /at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)\)?$/;
// SpiderMonkey (Firefox) / JSC (Safari): "functionName@file:line:col"
const smFrameRe = /(?:^|@)(.+?):(\d+):(\d+)$/;

function captureCallerInfo(): string | undefined {
  // biome-ignore lint/suspicious/useErrorMessage: we only need the stack trace, not the message
  const { stack } = new Error();
  if (!stack) {
    return undefined;
  }

  const lines = stack.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and the "Error" header
    if (!trimmed || trimmed === "Error") {
      continue;
    }

    // Skip frames from logtape internals (both @logtape/logtape and @mugenlabs/logtape-devtools)
    if (/logtape/i.test(trimmed)) {
      continue;
    }

    // Try V8 format first, then SpiderMonkey/JSC
    const match = v8FrameRe.exec(trimmed) ?? smFrameRe.exec(trimmed);
    if (!match) {
      continue;
    }

    const [, filePath, lineNo, colNo] = match;

    // Extract just the filename from the full path/URL
    const fileName =
      filePath
        .replace(/[?#].*$/, "")
        .split("/")
        .pop() ?? filePath;

    return `${fileName}:${lineNo}:${colNo}`;
  }

  return undefined;
}

function normalizeRecord(record: LogRecord, captureStack: boolean, id: string): DevtoolsLogRecord {
  const normalized: DevtoolsLogRecord = {
    category: [...record.category],
    id,
    level: record.level as LogLevel,
    message: [...record.message],
    messageText: renderMessage(record.message),
    properties: safeCloneProperties(record.properties),
    timestamp: record.timestamp,
  };

  if (captureStack) {
    const caller = captureCallerInfo();
    if (caller) {
      normalized.caller = caller;
    }
  }

  return normalized;
}

function isProductionEnv(): boolean {
  try {
    // Bundlers (Vite, webpack, etc.) statically replace this at build time
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
      return true;
    }
  } catch {
    // process may not exist in browser environments
  }
  return false;
}

/** Options for {@link createDevtoolsSink}. */
export interface DevtoolsSinkOptions {
  /**
   * Capture the source location of each log call via stack trace parsing.
   *
   * Relies on `new Error().stack`, which is engine-dependent. Automatically
   * disabled in production builds (when `process.env.NODE_ENV === "production"`)
   * because minified bundles produce meaningless file/line references. Note that
   * source maps do not help here — browsers do not apply source maps to
   * `Error.stack`.
   *
   * Also skipped while no devtools panel is mounted (the store has no
   * subscribers), unless `forceStackTrace` is `true`.
   *
   * @experimental
   * @default true
   */
  captureStackTrace?: boolean;
  /**
   * Force stack trace capture even in production builds and while the panel is
   * closed. Only has an effect when `captureStackTrace` is `true`.
   *
   * @default false
   */
  forceStackTrace?: boolean;
  /** Custom log store instance. Defaults to the shared store. */
  store?: LogStore;
}

/**
 * Creates a LogTape sink that forwards log records to the devtools panel.
 *
 * Usage:
 * ```ts
 * import { configure } from "@logtape/logtape";
 * import { createDevtoolsSink } from "@mugenlabs/logtape-devtools";
 *
 * await configure({
 *   sinks: { devtools: createDevtoolsSink() },
 *   loggers: [
 *     { category: ["app"], lowestLevel: "debug", sinks: ["devtools"] },
 *   ],
 * });
 * ```
 */
export function createDevtoolsSink(options?: DevtoolsSinkOptions): Sink {
  const store = options?.store ?? defaultLogStore;
  const wantsStack = options?.captureStackTrace ?? true;
  const forceStack = options?.forceStackTrace ?? false;
  const captureStack = wantsStack && (forceStack || !isProductionEnv());

  // Per-sink counter, plus a random discriminator so that two sinks sharing a
  // single store cannot emit the same id for records with equal timestamps.
  const sinkId = Math.random().toString(36).slice(2, 8);
  let counter = 0;

  return (record: LogRecord) => {
    try {
      // Stack capture is the most expensive part of normalization — skip it
      // while nothing is watching the store (i.e. no panel is mounted).
      const shouldCaptureStack = captureStack && (forceStack || store.hasListeners());
      counter += 1;
      const normalized = normalizeRecord(
        record,
        shouldCaptureStack,
        `log-${sinkId}-${counter}-${record.timestamp}`
      );
      store.addRecord(normalized);
    } catch {
      // Fail silently — devtools should never break the application
    }
  };
}
