import {
  createRecordCloner,
  MAX_DEPTH,
  MAX_ENTRIES,
  MAX_STRING_LENGTH,
  MAX_VALUES_PER_RECORD,
} from "./clone";

const clone = (value: unknown) => createRecordCloner()(value);

function nest(levels: number): Record<string, unknown> {
  let value: Record<string, unknown> = { leaf: true };
  for (let i = 0; i < levels; i += 1) {
    value = { child: value };
  }
  return value;
}

describe("createRecordCloner", () => {
  it("deep-copies plain objects and arrays", () => {
    const source = { nested: { list: [1, "two", null, undefined, true] } };
    const copy = clone(source) as typeof source;
    expect(copy).toStrictEqual(source);
    expect(copy.nested).not.toBe(source.nested);
    expect(copy.nested.list).not.toBe(source.nested.list);
  });

  it("keeps Date, RegExp, Map and Set types", () => {
    const source = {
      date: new Date(0),
      map: new Map([["a", { n: 1 }]]),
      re: /x+/gi,
      set: new Set([1, 2]),
    };
    const copy = clone(source) as typeof source;
    expect(copy.date).toBeInstanceOf(Date);
    expect(copy.date).not.toBe(source.date);
    expect(copy.date.getTime()).toBe(0);
    expect(copy.re).toBeInstanceOf(RegExp);
    expect(copy.re.flags).toBe("gi");
    expect(copy.map).toBeInstanceOf(Map);
    expect(copy.map.get("a")).toStrictEqual({ n: 1 });
    expect(copy.map.get("a")).not.toBe(source.map.get("a"));
    expect(copy.set).toStrictEqual(new Set([1, 2]));
  });

  it("keeps an Error's prototype, message, stack, cause and custom fields", () => {
    const cause = new Error("root");
    const error = Object.assign(new TypeError("bad", { cause }), { code: "E_BAD" });
    const copy = clone(error) as TypeError & { code: string };
    expect(copy).toBeInstanceOf(TypeError);
    expect(copy).not.toBe(error);
    expect(copy.name).toBe("TypeError");
    expect(copy.message).toBe("bad");
    expect(copy.stack).toBe(error.stack);
    expect(copy.code).toBe("E_BAD");
    expect(copy.cause).toBeInstanceOf(Error);
    expect((copy.cause as Error).message).toBe("root");
  });

  it("preserves cycles and shared references", () => {
    const shared = { id: 1 };
    const source: Record<string, unknown> = { a: shared, b: shared };
    source.self = source;
    const copy = clone(source) as Record<string, unknown>;
    expect(copy.self).toBe(copy);
    expect(copy.a).toBe(copy.b);
    expect(copy.a).not.toBe(shared);
  });

  it("shares identity across calls for the same record", () => {
    const cloner = createRecordCloner();
    const value = { id: 1 };
    expect(cloner(value)).toBe(cloner(value));
  });

  it("replaces functions with a description", () => {
    expect(clone({ fn: () => 1 })).toStrictEqual({ fn: "[Function fn]" });
  });

  it("replaces DOM nodes and binary data with a description", () => {
    const copy = clone({
      buffer: new ArrayBuffer(8),
      bytes: new Uint8Array(4),
      node: document.createElement("button"),
    });
    expect(copy).toStrictEqual({
      buffer: "[ArrayBuffer]",
      bytes: "[Uint8Array]",
      node: "[HTMLButtonElement]",
    });
  });

  it("copies class instances as plain objects of their own keys", () => {
    class Point {
      x = 1;
      y = 2;
      get sum() {
        return this.x + this.y;
      }
    }
    expect(clone(new Point())).toStrictEqual({ x: 1, y: 2 });
  });

  it("cuts objects nested deeper than MAX_DEPTH", () => {
    const copy = clone(nest(MAX_DEPTH + 2));
    let node = copy as Record<string, unknown>;
    for (let i = 0; i < MAX_DEPTH; i += 1) {
      node = node.child as Record<string, unknown>;
    }
    expect(node.child).toBe("[Truncated: [Object]]");
  });

  it("keeps the first MAX_ENTRIES array items and counts the rest", () => {
    const copy = clone(Array.from({ length: MAX_ENTRIES + 5 }, (_, i) => i)) as unknown[];
    expect(copy).toHaveLength(MAX_ENTRIES + 1);
    expect(copy[MAX_ENTRIES - 1]).toBe(MAX_ENTRIES - 1);
    expect(copy[MAX_ENTRIES]).toBe("[Truncated: 5 more items]");
  });

  it("keeps the first MAX_ENTRIES object keys and counts the rest", () => {
    const source = Object.fromEntries(
      Array.from({ length: MAX_ENTRIES + 3 }, (_, i) => [`k${i}`, i])
    );
    const copy = clone(source) as Record<string, unknown>;
    expect(Object.keys(copy)).toHaveLength(MAX_ENTRIES + 1);
    expect(copy["[Truncated]"]).toBe("[Truncated: 3 more keys]");
  });

  it("keeps the first MAX_ENTRIES Map and Set entries", () => {
    const entries = Array.from({ length: MAX_ENTRIES + 2 }, (_, i) => i);
    const map = clone(new Map(entries.map((i) => [i, i]))) as Map<unknown, unknown>;
    const set = clone(new Set(entries)) as Set<unknown>;
    expect(map.size).toBe(MAX_ENTRIES + 1);
    expect(map.get("[Truncated]")).toBe("[Truncated: 2 more entries]");
    expect(set.size).toBe(MAX_ENTRIES + 1);
    expect(set.has("[Truncated: 2 more entries]")).toBe(true);
  });

  it("cuts strings longer than MAX_STRING_LENGTH", () => {
    const copy = clone("x".repeat(MAX_STRING_LENGTH + 7)) as string;
    expect(copy.startsWith("x".repeat(MAX_STRING_LENGTH))).toBe(true);
    expect(copy.endsWith("[Truncated: 7 more characters]")).toBe(true);
  });

  it("stops copying once a record's value budget is spent", () => {
    // Arrays of MAX_ENTRIES items, so only the budget can stop the copy.
    const rows = Math.ceil(MAX_VALUES_PER_RECORD / MAX_ENTRIES) + 2;
    const source = Array.from({ length: rows }, () =>
      Array.from({ length: MAX_ENTRIES }, () => ({ v: "x" }))
    );
    const cloner = createRecordCloner();
    const copy = (source as unknown[]).map((row) => cloner(row)) as unknown[][];
    const last = copy.at(-1);
    expect(last).toBe("[Truncated: [Array]]");
  });

  it("snapshots what toJSON returns, including from a class prototype", () => {
    class Money {
      readonly #cents: number;
      constructor(cents: number) {
        this.#cents = cents;
      }
      toJSON() {
        return { amount: this.#cents / 100 };
      }
    }
    expect(clone({ price: new Money(250) })).toStrictEqual({ price: { amount: 2.5 } });
  });

  it("survives throwing getters and revoked proxies", () => {
    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    const source = {
      get boom() {
        throw new Error("nope");
      },
      ok: 1,
      proxy: revocable.proxy,
    };
    expect(clone(source)).toStrictEqual({ boom: "[Unreadable]", ok: 1, proxy: "[Unreadable]" });
  });
});
