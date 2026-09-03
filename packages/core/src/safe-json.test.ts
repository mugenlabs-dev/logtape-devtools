import { safeCloneProperties, safeStringify } from "./safe-json";

const parse = (value: unknown) => JSON.parse(safeStringify(value)) as unknown;

describe("safeStringify", () => {
  it("serializes plain JSON values unchanged", () => {
    expect(safeStringify({ a: 1, b: ["x", null], c: { d: true } })).toBe(
      JSON.stringify({ a: 1, b: ["x", null], c: { d: true } })
    );
    expect(safeStringify("text")).toBe('"text"');
    expect(safeStringify(3)).toBe("3");
  });

  it("renders Error objects with name, message, stack and cause", () => {
    const cause = new Error("root");
    const err = new Error("boom", { cause });
    const result = parse({ err }) as { err: Record<string, unknown> };

    expect(result.err.name).toBe("Error");
    expect(result.err.message).toBe("boom");
    expect(typeof result.err.stack).toBe("string");
    expect((result.err.cause as Record<string, unknown>).message).toBe("root");
  });

  it("renders Map and Set contents", () => {
    const result = parse({ m: new Map([["a", 1]]), s: new Set([1, 2]) });
    expect(result).toStrictEqual({ m: [["a", 1]], s: [1, 2] });
  });

  it("renders BigInt without dropping sibling keys", () => {
    expect(parse({ n: 10n, ok: 2 })).toStrictEqual({ n: "10n", ok: 2 });
    expect(safeStringify(5n)).toBe('"5n"');
  });

  it("renders symbols and functions readably", () => {
    const named = () => 1;
    const result = parse({ fn: named, sym: Symbol("tag") }) as Record<string, string>;
    expect(result.fn).toBe("[Function named]");
    expect(result.sym).toBe("Symbol(tag)");
  });

  it("marks a direct cycle as [Circular]", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    expect(parse(obj)).toStrictEqual({ a: 1, self: "[Circular]" });
  });

  it("keeps shared references that are not cycles", () => {
    const shared = { v: 1 };
    const obj: Record<string, unknown> = { x: shared, y: shared };
    obj.self = obj;
    expect(parse(obj)).toStrictEqual({ self: "[Circular]", x: { v: 1 }, y: { v: 1 } });
  });

  it("marks a cycle through a nested object", () => {
    const parent: Record<string, unknown> = { name: "parent" };
    const child = { name: "child", parent };
    parent.children = [child];
    expect(parse(parent)).toStrictEqual({
      children: [{ name: "child", parent: "[Circular]" }],
      name: "parent",
    });
  });

  it("marks an Error whose cause is itself as circular", () => {
    const err = new Error("loop");
    (err as { cause?: unknown }).cause = err;
    const result = parse({ err }) as { err: Record<string, unknown> };
    expect(result.err.cause).toBe("[Circular]");
  });

  it("falls back to String() for a throwing toJSON", () => {
    const value = {
      toJSON() {
        throw new Error("nope");
      },
      toString: () => "custom",
    };
    expect(safeStringify(value)).toBe("custom");
  });

  it("supports indentation", () => {
    expect(safeStringify({ a: 1 }, 2)).toBe('{\n  "a": 1\n}');
  });
});

describe("safeCloneProperties", () => {
  it("deep-clones plain objects", () => {
    const source = { nested: { list: [1, 2] } };
    const clone = safeCloneProperties(source);
    expect(clone).toStrictEqual(source);
    expect(clone.nested).not.toBe(source.nested);
  });

  it("falls back per entry when structuredClone rejects a value", () => {
    const clone = safeCloneProperties({ fn: () => 1, ok: "yes" });
    expect(clone.ok).toBe("yes");
    expect(clone.fn).toBe("[Function fn]");
  });
});
