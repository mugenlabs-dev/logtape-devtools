/**
 * JSON helpers shared by the sink and the panel.
 *
 * This module is intentionally React-free so that it can be pulled into the
 * `@mugenlabs/logtape-devtools/sink` entry point.
 */

/**
 * Map values JSON cannot represent (or would silently flatten to `{}`) onto a
 * readable equivalent. Anything else is returned untouched.
 */
function toSerializable(value: unknown): unknown {
  switch (typeof value) {
    case "bigint":
      return `${value}n`;
    case "symbol":
      return value.toString();
    case "function":
      return `[Function ${value.name || "anonymous"}]`;
    default:
      break;
  }
  if (value instanceof Error) {
    const error: Record<string, unknown> = { message: value.message, name: value.name };
    if (value.stack) {
      error.stack = value.stack;
    }
    if ("cause" in value && value.cause !== undefined) {
      error.cause = value.cause;
    }
    return error;
  }
  if (value instanceof Map) {
    return [...value.entries()];
  }
  if (value instanceof Set) {
    return [...value];
  }
  return value;
}

interface Ancestor {
  /** The value as it appeared in the source graph — used for cycle detection. */
  original: object;
  /** What JSON.stringify actually recursed into — used to unwind the stack. */
  serialized: object;
}

/**
 * Replacer that marks true cycles as `"[Circular]"` while leaving shared
 * (non-circular) references intact, and converts unrepresentable values via
 * {@link toSerializable}.
 */
function createReplacer(): (this: unknown, key: string, value: unknown) => unknown {
  const ancestors: Ancestor[] = [];
  return function replace(this: unknown, _key, value) {
    // `this` is the object holding `key`; unwind to the current branch.
    while (ancestors.length > 0 && ancestors.at(-1)?.serialized !== this) {
      ancestors.pop();
    }
    if (typeof value === "object" && value !== null) {
      if (ancestors.some((ancestor) => ancestor.original === value)) {
        return "[Circular]";
      }
      const serialized = toSerializable(value);
      if (typeof serialized === "object" && serialized !== null) {
        ancestors.push({ original: value, serialized });
      }
      return serialized;
    }
    return toSerializable(value);
  };
}

/**
 * Serializes any value to JSON, never throwing.
 *
 * Errors, Maps, Sets, BigInts, symbols and functions are rendered in a readable
 * form instead of being dropped, circular references become `"[Circular]"`,
 * and anything still unserializable falls back to `String(value)`.
 */
export function safeStringify(value: unknown, indent?: number): string {
  try {
    const json = JSON.stringify(value, createReplacer(), indent);
    if (json !== undefined) {
      return json;
    }
  } catch {
    // A throwing `toJSON` or getter — fall through.
  }
  return String(value);
}

function jsonClone(value: unknown): unknown {
  return JSON.parse(safeStringify(value));
}

/**
 * Deep-clones a properties bag, never throwing.
 *
 * Uses `structuredClone` when available and degrades per entry (via a JSON
 * round trip, then `String(value)`) so that a single unclonable value cannot
 * drop the whole object.
 */
export function safeCloneProperties(properties: Record<string, unknown>): Record<string, unknown> {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(properties);
    } catch {
      // Functions, DOM nodes, proxies… fall through to the JSON path.
    }
  }

  try {
    return jsonClone(properties) as Record<string, unknown>;
  } catch {
    // Fall through to the per-entry path.
  }

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(properties)) {
    try {
      result[key] = jsonClone(entry);
    } catch {
      result[key] = String(entry);
    }
  }
  return result;
}
