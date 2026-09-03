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

  it("generates unique IDs across two sinks sharing one store", () => {
    const store = createLogStore();
    const sinkA = createDevtoolsSink({ store });
    const sinkB = createDevtoolsSink({ store });
    const record = makeLogRecord();
    sinkA(record);
    sinkB(record);

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

  it("safely clones properties with circular references", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });

    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;

    sink(makeLogRecord({ properties: circular }));
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0].properties.a).toBe(1);
    // structuredClone preserves the cycle, but the clone must be detached
    expect(snap[0].properties.self).not.toBe(circular);
  });

  it("safely clones properties containing values structuredClone rejects", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });

    sink(makeLogRecord({ properties: { a: 1, fn: () => "nope" } }));
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0].properties.a).toBe(1);
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

  it("skips stack capture while the store has no listeners", () => {
    const store = createLogStore();
    const hasListeners = vi.spyOn(store, "hasListeners");
    const sink = createDevtoolsSink({ store });

    sink(makeLogRecord());

    expect(hasListeners).toHaveBeenCalled();
    expect(hasListeners).toHaveReturnedWith(false);
    expect(store.getSnapshot()[0].caller).toBeUndefined();
  });

  it("attempts stack capture once the store has a listener", () => {
    const store = createLogStore();
    store.subscribe(() => {
      // panel mounted
    });
    const hasListeners = vi.spyOn(store, "hasListeners");
    const sink = createDevtoolsSink({ store });

    sink(makeLogRecord());

    expect(hasListeners).toHaveReturnedWith(true);
  });

  it("does not gate on listeners when forceStackTrace is set", () => {
    const store = createLogStore();
    const hasListeners = vi.spyOn(store, "hasListeners");
    const sink = createDevtoolsSink({ forceStackTrace: true, store });

    sink(makeLogRecord());

    expect(hasListeners).not.toHaveBeenCalled();
  });

  it("never captures the caller when captureStackTrace is false", () => {
    const store = createLogStore();
    store.subscribe(() => {
      // panel mounted
    });
    const hasListeners = vi.spyOn(store, "hasListeners");
    const sink = createDevtoolsSink({ captureStackTrace: false, store });

    sink(makeLogRecord());

    expect(hasListeners).not.toHaveBeenCalled();
    expect(store.getSnapshot()[0].caller).toBeUndefined();
  });

  it("skips all work when the store has no capacity", () => {
    const store = createLogStore({ maxRecords: 0 });
    const addRecord = vi.spyOn(store, "addRecord");
    const sink = createDevtoolsSink({ store });

    sink(makeLogRecord());

    expect(addRecord).not.toHaveBeenCalled();
  });

  it("renders messageText lazily and consistently", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });
    const heavy = { toJSON: vi.fn(() => "rendered") };
    sink(makeLogRecord({ message: ["value: ", heavy] }));

    const [record] = store.getSnapshot();
    expect(heavy.toJSON).not.toHaveBeenCalled();
    expect(record.messageText).toBe('value: "rendered"');
    expect(record.messageText).toBe('value: "rendered"');
    expect(heavy.toJSON).toHaveBeenCalledTimes(1);
    expect(Object.keys(record)).toContain("messageText");
  });

  it("stops writing once disposed", () => {
    const store = createLogStore();
    const sink = createDevtoolsSink({ store });
    sink(makeLogRecord());

    sink[Symbol.dispose]();
    sink(makeLogRecord());

    expect(store.getSnapshot()).toHaveLength(1);
  });
});
