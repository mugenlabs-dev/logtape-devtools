import type { LogRecord } from "@logtape/logtape";
import { createDevtoolsSink } from "./sink";
import { createLogStore } from "./store";

function makeLogRecord(overrides: Partial<LogRecord> = {}): LogRecord {
  return {
    category: ["test", "unit"],
    level: "info",
    message: ["hello ", "world"],
    properties: { foo: "bar" },
    rawMessage: "hello {name}",
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("createDevtoolsSink", () => {
  it("creates a sink function", () => {
    const sink = createDevtoolsSink();
    expect(typeof sink).toBe("function");
  });

  it("forwards records to the provided store", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });
    sink(makeLogRecord());

    const snap = store.getSnapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0].messageText).toBe("hello world");
    expect(snap[0].category).toEqual(["test", "unit"]);
    expect(snap[0].level).toBe("info");
    expect(snap[0].properties).toEqual({ foo: "bar" });
  });

  it("generates unique IDs for each record", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });
    sink(makeLogRecord());
    sink(makeLogRecord());

    const snap = store.getSnapshot();
    expect(snap[0].id).not.toBe(snap[1].id);
  });

  it("renders message parts into messageText", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });

    sink(makeLogRecord({ message: ["count: ", 42, " items"] }));
    expect(store.getSnapshot()[0].messageText).toBe("count: 42 items");
  });

  it("handles null and undefined in message parts", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });

    sink(makeLogRecord({ message: ["value: ", null, " and ", undefined] }));
    expect(store.getSnapshot()[0].messageText).toBe("value: null and undefined");
  });

  it("safely clones properties with non-serializable values", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });

    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;

    sink(makeLogRecord({ properties: circular }));
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(1);
    // The circular ref should be stringified as a fallback
    expect(snap[0].properties.a).toBe(1);
    expect(typeof snap[0].properties.self).toBe("string");
  });

  it("never throws even if store.addRecord throws", () => {
    const store = createLogStore();
    const originalAdd = store.addRecord;
    store.addRecord = () => {
      throw new Error("boom");
    };
    const sink = createDevtoolsSink({ store });

    expect(() => sink(makeLogRecord())).not.toThrow();
    store.addRecord = originalAdd;
  });

  it("copies category array (no shared references)", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });
    const category = ["app", "db"];
    sink(makeLogRecord({ category }));

    const snap = store.getSnapshot();
    expect(snap[0].category).toEqual(["app", "db"]);
    expect(snap[0].category).not.toBe(category);
  });
});
