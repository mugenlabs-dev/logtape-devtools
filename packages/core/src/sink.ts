import type { LogRecord, Sink } from "@logtape/logtape";
import { createRecordCloner } from "./clone";
import { safeStringify } from "./safe-json";
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

// Frames from LogTape and from this package, matched on the file path only so
// user files and functions with "logtape" in their name still count:
// - installed packages, including pnpm's store and bundler prebundles
//   (`@logtape/logtape`, `@logtape_logtape.js`, `@mugenlabs/logtape-devtools`)
// - this repo's own source and build, when the demo links the workspace package
const internalFrameRe =
  /@logtape[/_]|@mugenlabs[/_]logtape-devtools|[/\\]logtape-devtools[/\\]packages[/\\]core[/\\]/;

/** First stack frame outside LogTape and this package, as `file:line:col`. */
export function parseCallerFrame(stack: string): string | undefined {
  for (const line of stack.split("\n")) {
    const trimmed = line.trim();

    // Skip empty lines and the "Error" header
    if (!trimmed || trimmed === "Error") {
      continue;
    }

    // Try V8 format first, then SpiderMonkey/JSC
    const match = v8FrameRe.exec(trimmed) ?? smFrameRe.exec(trimmed);
    if (!match) {
      continue;
    }

    const [, filePath, lineNo, colNo] = match;
    if (internalFrameRe.test(filePath)) {
      continue;
    }

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

function captureCallerInfo(): string | undefined {
  // biome-ignore lint/suspicious/useErrorMessage: we only need the stack trace, not the message
  const { stack } = new Error();
  return stack ? parseCallerFrame(stack) : undefined;
}

function normalizeRecord(record: LogRecord, captureStack: boolean, id: string): DevtoolsLogRecord {
  // Copy interpolated values too, not just properties: the app may mutate them
  // after logging, and holding them would keep large objects (DOM nodes,
  // stores) alive for as long as the record is buffered.
  const clone = createRecordCloner();
  const message = record.message.map((part) => clone(part));
  const category = [...record.category];
  const normalized = {
    category,
    // Joined once at normalize time so filter/search hot paths avoid `.join` per render.
    categoryKey: category.join("."),
    id,
    level: record.level as LogLevel,
    message,
    properties: clone(record.properties) as Record<string, unknown>,
    timestamp: record.timestamp,
  } as DevtoolsLogRecord;

  // Rendering the message serialises every interpolated value, so defer it to
  // the first read (search or display) instead of paying for it on every log.
  let messageText: string | undefined;
  Object.defineProperty(normalized, "messageText", {
    configurable: true,
    enumerable: true,
    get: () => {
      messageText ??= renderMessage(message);
      return messageText;
    },
  });

  // Lowercasing is deferred with messageText so cold ingest stays cheap.
  let messageSearchText: string | undefined;
  Object.defineProperty(normalized, "messageSearchText", {
    configurable: true,
    enumerable: true,
    get: () => {
      if (messageSearchText === undefined) {
        messageText ??= renderMessage(message);
        messageSearchText = messageText.toLowerCase();
      }
      return messageSearchText;
    },
  });

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
    // Written out literally so bundlers (Vite, webpack, etc.) replace it at build
    // time. A `typeof process` guard or `?.` would stop the replacement, and the
    // check would then always be false in the browser.
    return process.env.NODE_ENV === "production";
  } catch {
    // No bundler replaced it and `process` does not exist (e.g. a plain browser).
    return false;
  }
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
 * A LogTape sink that is also disposable. LogTape disposes sinks when the
 * configuration is reset; a disposed sink stops writing to its store.
 */
export type DevtoolsSink = Sink & Disposable;

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
export function createDevtoolsSink(options?: DevtoolsSinkOptions): DevtoolsSink {
  const store = options?.store ?? defaultLogStore;
  const wantsStack = options?.captureStackTrace ?? true;
  const forceStack = options?.forceStackTrace ?? false;
  const captureStack = wantsStack && (forceStack || !isProductionEnv());

  // Per-sink counter, plus a random discriminator so that two sinks sharing a
  // single store cannot emit the same id for records with equal timestamps.
  const sinkId = Math.random().toString(36).slice(2, 8);
  let counter = 0;
  let disposed = false;

  const sink = (record: LogRecord): void => {
    // A store with no capacity drops every record, so skip normalisation too.
    if (disposed || store.getMaxRecords?.() === 0) {
      return;
    }
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

  return Object.assign(sink, {
    [Symbol.dispose]: () => {
      disposed = true;
    },
  });
}
