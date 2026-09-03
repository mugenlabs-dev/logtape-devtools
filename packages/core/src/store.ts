import type { DevtoolsLogRecord } from "./types";

type Listener = () => void;

/**
 * Reactive log record container backing the devtools panel.
 *
 * Records are kept in a fixed-capacity ring buffer so appending is O(1); the
 * array returned by {@link LogStore.getSnapshot} is rebuilt lazily at most once
 * per mutation batch. Listener notifications are coalesced into a microtask, so
 * a synchronous burst of {@link LogStore.addRecord} calls results in a single
 * notification.
 */
export interface LogStore {
  /** Appends a record, evicting the oldest one when the max size is reached. */
  addRecord: (record: DevtoolsLogRecord) => void;
  /** Removes every record and notifies subscribers. */
  clear: () => void;
  /**
   * Returns the current records, oldest first.
   *
   * The reference is stable until the store changes, which makes it safe to use
   * with `useSyncExternalStore`.
   */
  getSnapshot: () => DevtoolsLogRecord[];
  /**
   * Whether anything is currently subscribed to the store.
   *
   * Used by the sink to skip expensive work (such as stack trace capture) while
   * no devtools panel is mounted.
   */
  hasListeners: () => boolean;
  /** Updates the maximum number of retained records, trimming if needed. */
  setMaxSize: (size: number) => void;
  /** Registers a change listener. Returns an unsubscribe function. */
  subscribe: (listener: Listener) => () => void;
}

/** Options for {@link createLogStore}. */
export interface LogStoreOptions {
  /**
   * Maximum number of log records to retain. Older records are evicted first.
   *
   * @default 1000
   */
  maxRecords?: number;
}

const DEFAULT_MAX_RECORDS = 1000;

/**
 * Coerce a user-supplied capacity into a non-negative integer. Fractions would
 * defeat the `size < max` capacity check and NaN would wedge the ring buffer.
 */
function normalizeMaxRecords(value: number | undefined): number {
  const numeric = Math.floor(Number(value ?? DEFAULT_MAX_RECORDS));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function schedule(callback: () => void): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }
  Promise.resolve().then(callback);
}

/**
 * Creates an isolated log store.
 *
 * Pass the same instance to `createDevtoolsSink` and
 * `createLogTapeDevtoolsPlugin` to keep the sink and the panel in sync.
 *
 * ```ts
 * const store = createLogStore({ maxRecords: 5000 });
 * ```
 */
export function createLogStore(options?: LogStoreOptions): LogStore {
  let max = normalizeMaxRecords(options?.maxRecords);

  // Ring buffer: `start` is the index of the oldest record, `size` the number
  // of live entries. Appending is O(1) — no per-record array copy.
  let buffer: DevtoolsLogRecord[] = [];
  let start = 0;
  let size = 0;

  let snapshot: DevtoolsLogRecord[] = [];
  let snapshotDirty = false;

  const listeners = new Set<Listener>();
  let notifyScheduled = false;

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function notify() {
    if (notifyScheduled) {
      return;
    }
    notifyScheduled = true;
    schedule(() => {
      notifyScheduled = false;
      emit();
    });
  }

  /** Materializes the ring buffer into a plain, oldest-first array. */
  function toArray(): DevtoolsLogRecord[] {
    const result: DevtoolsLogRecord[] = new Array(size);
    for (let i = 0; i < size; i += 1) {
      result[i] = buffer[(start + i) % buffer.length];
    }
    return result;
  }

  /**
   * Rewrites the buffer in logical order, dropping records beyond `max`.
   * Keeps the invariant that a below-capacity buffer is linear (`start === 0`).
   */
  function normalize(): boolean {
    const trimmed = size > max;
    const kept = trimmed ? toArray().slice(size - max) : toArray();
    buffer = kept;
    start = 0;
    size = kept.length;
    return trimmed;
  }

  return {
    addRecord: (record) => {
      if (max === 0) {
        return;
      }
      if (size < max) {
        // Below capacity — the buffer is linear, so a plain append is enough.
        buffer.push(record);
        size += 1;
      } else {
        // At capacity — overwrite the oldest slot.
        buffer[start] = record;
        start = (start + 1) % buffer.length;
      }
      snapshotDirty = true;
      notify();
    },
    clear: () => {
      buffer = [];
      start = 0;
      size = 0;
      snapshotDirty = true;
      notify();
    },
    getSnapshot: () => {
      if (snapshotDirty) {
        snapshot = toArray();
        snapshotDirty = false;
      }
      return snapshot;
    },
    hasListeners: () => listeners.size > 0,
    setMaxSize: (nextMax) => {
      max = normalizeMaxRecords(nextMax);
      if (normalize()) {
        snapshotDirty = true;
        notify();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Default shared store instance used when no custom store is provided */
export const defaultLogStore = createLogStore();
