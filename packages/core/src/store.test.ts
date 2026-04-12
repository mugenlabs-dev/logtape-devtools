import { createLogStore } from "./store";
import type { DevtoolsLogRecord } from "./types";

function makeRecord(overrides: Partial<DevtoolsLogRecord> = {}): DevtoolsLogRecord {
  return {
    id: `log-${Math.random()}`,
    timestamp: Date.now(),
    level: "info",
    category: ["test"],
    message: ["hello"],
    messageText: "hello",
    properties: {},
    ...overrides,
  };
}

describe("createLogStore", () => {
  it("starts with an empty snapshot", () => {
    const store = createLogStore();
    expect(store.getSnapshot()).toEqual([]);
  });

  it("adds records and returns them via getSnapshot", () => {
    const store = createLogStore();
    const record = makeRecord();
    store.addRecord(record);
    expect(store.getSnapshot()).toEqual([record]);
  });

  it("returns a new array reference on each addRecord (for useSyncExternalStore)", () => {
    const store = createLogStore();
    const before = store.getSnapshot();
    store.addRecord(makeRecord());
    const after = store.getSnapshot();
    expect(before).not.toBe(after);
  });

  it("notifies subscribers on addRecord", () => {
    const store = createLogStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.addRecord(makeRecord());
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes correctly", () => {
    const store = createLogStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    store.addRecord(makeRecord());
    expect(listener).not.toHaveBeenCalled();
  });

  it("respects maxSize and trims oldest records", () => {
    const store = createLogStore(3);
    for (let i = 0; i < 5; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(3);
    expect(snap[0].id).toBe("log-2");
    expect(snap[2].id).toBe("log-4");
  });

  it("clears all records", () => {
    const store = createLogStore();
    store.addRecord(makeRecord());
    store.addRecord(makeRecord());
    store.clear();
    expect(store.getSnapshot()).toEqual([]);
  });

  it("notifies subscribers on clear", () => {
    const store = createLogStore();
    store.addRecord(makeRecord());
    const listener = vi.fn();
    store.subscribe(listener);
    store.clear();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("setMaxSize trims records if current count exceeds new max", () => {
    const store = createLogStore(10);
    for (let i = 0; i < 5; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    store.setMaxSize(2);
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(2);
    expect(snap[0].id).toBe("log-3");
    expect(snap[1].id).toBe("log-4");
  });

  it("setMaxSize notifies when trimming occurs", () => {
    const store = createLogStore(10);
    for (let i = 0; i < 5; i++) {
      store.addRecord(makeRecord());
    }
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMaxSize(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("setMaxSize does not notify when no trimming is needed", () => {
    const store = createLogStore(10);
    store.addRecord(makeRecord());
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMaxSize(5);
    expect(listener).not.toHaveBeenCalled();
  });
});
