import type { LogRecord, Sink } from "@logtape/logtape";
import { defaultLogStore, type LogStore } from "./store";
import type { DevtoolsLogRecord, LogLevel } from "./types";

let counter = 0;

function renderMessage(message: readonly unknown[]): string {
  return message
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (part === null || part === undefined) {
        return String(part);
      }
      try {
        return JSON.stringify(part);
      } catch {
        return String(part);
      }
    })
    .join("");
}

function safeCloneProperties(properties: Record<string, unknown>): Record<string, unknown> {
  try {
    return JSON.parse(JSON.stringify(properties));
  } catch {
    // Fallback: shallow copy with stringified values for non-serializable entries
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(properties)) {
      try {
        result[key] = JSON.parse(JSON.stringify(value));
      } catch {
        result[key] = String(value);
      }
    }
    return result;
  }
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
  const stack = new Error().stack;
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

function normalizeRecord(record: LogRecord, captureStack: boolean): DevtoolsLogRecord {
  const normalized: DevtoolsLogRecord = {
    id: `log-${++counter}-${record.timestamp}`,
    timestamp: record.timestamp,
    level: record.level as LogLevel,
    category: [...record.category],
    message: [...record.message],
    messageText: renderMessage(record.message),
    properties: safeCloneProperties(record.properties),
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

export interface DevtoolsSinkOptions {
  /**
   * Capture the source location of each log call via stack trace parsing.
   *
   * **Experimental / dev-only** — relies on `new Error().stack` which is
   * engine-dependent. Automatically disabled in production builds (when
   * `process.env.NODE_ENV === "production"`) because minified bundles
   * produce meaningless file/line references. Note that source maps do not
   * help here — browsers do not apply source maps to `Error.stack`.
   *
   * Set `forceStackTrace` to `true` to override the production guard — useful
   * when your production build ships unminified code.
   *
   * @default true
   */
  experimentalCaptureStackTrace?: boolean;
  /**
   * Force stack trace capture even in production builds.
   * Only has an effect when `experimentalCaptureStackTrace` is `true`.
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
  const wantsStack = options?.experimentalCaptureStackTrace ?? true;
  const captureStack = wantsStack && (options?.forceStackTrace || !isProductionEnv());

  return (record: LogRecord) => {
    try {
      const normalized = normalizeRecord(record, captureStack);
      store.addRecord(normalized);
    } catch {
      // Fail silently — devtools should never break the application
    }
  };
}
