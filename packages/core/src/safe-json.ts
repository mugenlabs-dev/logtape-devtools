/**
 * JSON helpers shared by the sink and the panel.
 *
 * This module is intentionally React-free so that it can be pulled into the
 * `@mugenlabs/logtape-devtools/sink` entry point.
 */

/** Replacer that turns circular references into a `"[Circular]"` marker. */
function circularSafeReplacer(): (key: string, value: unknown) => unknown {
  const seen = new WeakSet<object>();
  return (_key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
}

/**
 * Serializes any value to JSON, never throwing.
 *
 * Falls back to a circular-reference-safe pass, then to `String(value)` for
 * values JSON cannot represent at all (`undefined`, symbols, BigInt…).
 */
export function safeStringify(value: unknown, indent?: number): string {
  try {
    const json = JSON.stringify(value, null, indent);
    if (json !== undefined) {
      return json;
    }
  } catch {
    // Circular references, or a throwing `toJSON`.
  }
  try {
    const json = JSON.stringify(value, circularSafeReplacer(), indent);
    if (json !== undefined) {
      return json;
    }
  } catch {
    // Still unserializable — fall through.
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
