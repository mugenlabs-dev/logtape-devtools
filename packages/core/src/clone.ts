/**
 * Size-limited deep copy for log records.
 *
 * The sink copies every record's properties and interpolated message values at
 * log time, so later mutations do not change what the panel shows and the store
 * holds no references into the app. Each record gets its own budget, so a
 * single huge payload cannot cost more than a bounded amount of memory.
 *
 * React-free, so it can be pulled into the `/sink` entry point.
 */

/** Objects and arrays nested deeper than this are replaced by a marker. */
export const MAX_DEPTH = 8;
/** Keys per object, items per array and entries per Map or Set that are kept. */
export const MAX_ENTRIES = 100;
/** Strings longer than this are cut. */
export const MAX_STRING_LENGTH = 10_000;
/** Values copied per record, across all its properties and message values. */
export const MAX_VALUES_PER_RECORD = 5000;

const truncatedKey = "[Truncated]";
const unreadable = "[Unreadable]";

type Clone = (value: unknown, depth: number) => unknown;

function more(count: number, noun: string): string {
  return `[Truncated: ${count} more ${noun}]`;
}

function describe(value: object): string {
  const name = value.constructor?.name;
  return name ? `[${name}]` : "[Object]";
}

function cutString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_STRING_LENGTH)}${more(value.length - MAX_STRING_LENGTH, "characters")}`;
}

/** Values copied without walking them, or `undefined` when they need a walk. */
function copyLeafObject(value: object): unknown {
  if (typeof Node !== "undefined" && value instanceof Node) {
    // Holding a node keeps it, and often its whole tree, alive.
    return describe(value);
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return describe(value);
  }
  return undefined;
}

function copyArray(value: unknown[], copy: unknown[], clone: Clone, depth: number): void {
  const kept = Math.min(value.length, MAX_ENTRIES);
  for (let i = 0; i < kept; i += 1) {
    copy.push(clone(value[i], depth));
  }
  if (value.length > kept) {
    copy.push(more(value.length - kept, "items"));
  }
}

function copyMap(
  value: Map<unknown, unknown>,
  copy: Map<unknown, unknown>,
  clone: Clone,
  depth: number
): void {
  for (const [key, entry] of value) {
    if (copy.size === MAX_ENTRIES) {
      copy.set(truncatedKey, more(value.size - MAX_ENTRIES, "entries"));
      return;
    }
    copy.set(clone(key, depth), clone(entry, depth));
  }
}

function copySet(value: Set<unknown>, copy: Set<unknown>, clone: Clone, depth: number): void {
  for (const entry of value) {
    if (copy.size === MAX_ENTRIES) {
      copy.add(more(value.size - MAX_ENTRIES, "entries"));
      return;
    }
    copy.add(clone(entry, depth));
  }
}

/**
 * Errors keep their prototype (so `instanceof` and `name` still work) and their
 * own non-enumerable fields such as `message` and `stack`. Other objects become
 * plain objects of their own enumerable keys, as with structuredClone.
 */
function copyKeys(value: object, copy: object, clone: Clone, depth: number): void {
  const isError = value instanceof Error;
  const keys = isError ? Object.getOwnPropertyNames(value) : Object.keys(value);
  const kept = Math.min(keys.length, MAX_ENTRIES);
  for (let i = 0; i < kept; i += 1) {
    const key = keys[i];
    let entry: unknown;
    try {
      entry = clone((value as Record<string, unknown>)[key], depth);
    } catch {
      // A throwing getter.
      entry = unreadable;
    }
    Object.defineProperty(copy, key, {
      configurable: true,
      enumerable: !isError || Object.prototype.propertyIsEnumerable.call(value, key),
      value: entry,
      writable: true,
    });
  }
  if (keys.length > kept) {
    (copy as Record<string, unknown>)[truncatedKey] = more(keys.length - kept, "keys");
  }
}

function emptyCopyOf(value: object): object {
  if (Array.isArray(value)) {
    return [];
  }
  if (value instanceof Map) {
    return new Map();
  }
  if (value instanceof Set) {
    return new Set();
  }
  return value instanceof Error ? Object.create(Object.getPrototypeOf(value)) : {};
}

/**
 * Returns a function that copies values for one record. Calls share the
 * record's value budget and identity map, so shared references and cycles
 * survive the copy.
 */
export function createRecordCloner(): (value: unknown) => unknown {
  const copies = new Map<object, unknown>();
  let budget = MAX_VALUES_PER_RECORD;

  const cloneObject = (value: object, depth: number): unknown => {
    if (copies.has(value)) {
      return copies.get(value);
    }
    if (budget < 0 || depth > MAX_DEPTH) {
      return `[Truncated: ${describe(value)}]`;
    }
    const leaf = copyLeafObject(value);
    if (leaf !== undefined) {
      return leaf;
    }
    // Snapshot what JSON (and so the panel) would show for objects such as
    // Decimal or Luxon values. Their data often lives in private fields that a
    // key-by-key copy cannot see.
    const { toJSON } = value as { toJSON?: unknown };
    if (typeof toJSON === "function" && !(value instanceof Error)) {
      const json: unknown = toJSON.call(value);
      if (json !== value) {
        // depth + 1, so a toJSON that keeps returning new objects still ends.
        return clone(json, depth + 1);
      }
    }

    const copy = emptyCopyOf(value);
    copies.set(value, copy);
    const next = depth + 1;
    if (Array.isArray(value)) {
      copyArray(value, copy as unknown[], clone, next);
    } else if (value instanceof Map) {
      copyMap(value, copy as Map<unknown, unknown>, clone, next);
    } else if (value instanceof Set) {
      copySet(value, copy as Set<unknown>, clone, next);
    } else {
      copyKeys(value, copy, clone, next);
    }
    return copy;
  };

  const clone: Clone = (value, depth) => {
    budget -= 1;
    switch (typeof value) {
      case "string":
        return budget < 0 ? truncatedKey : cutString(value);
      case "function":
        return `[Function ${value.name || "anonymous"}]`;
      case "object":
        if (value === null) {
          return null;
        }
        try {
          return cloneObject(value, depth);
        } catch {
          // A revoked proxy, a throwing trap or a throwing toJSON.
          return unreadable;
        }
      default:
        // number, boolean, bigint, symbol, undefined: immutable, keep as-is.
        return value;
    }
  };

  return (value) => clone(value, 0);
}
