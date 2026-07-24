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

/** Lets the batched (microtask-scheduled) notification flush. */
function flush() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
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

  it("returns a new array reference after a change (for useSyncExternalStore)", () => {
    const store = createLogStore();
    const before = store.getSnapshot();
    store.addRecord(makeRecord());
    const after = store.getSnapshot();
    expect(before).not.toBe(after);
  });

  it("returns a stable reference while nothing changes", () => {
    const store = createLogStore();
    store.addRecord(makeRecord());
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("notifies subscribers on addRecord", async () => {
    const store = createLogStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.addRecord(makeRecord());
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("coalesces a synchronous burst of addRecord calls into one notification", async () => {
    const store = createLogStore();
    const listener = vi.fn();
    store.subscribe(listener);

    for (let i = 0; i < 100; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }

    expect(listener).not.toHaveBeenCalled();
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toHaveLength(100);
  });

  it("notifies again for changes made after a flush", async () => {
    const store = createLogStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.addRecord(makeRecord());
    await flush();
    store.addRecord(makeRecord());
    await flush();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes correctly", async () => {
    const store = createLogStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    store.addRecord(makeRecord());
    await flush();
    expect(listener).not.toHaveBeenCalled();
  });

  it("reports whether it has listeners", () => {
    const store = createLogStore();
    expect(store.hasListeners()).toBe(false);

    const unsub = store.subscribe(vi.fn());
    expect(store.hasListeners()).toBe(true);

    unsub();
    expect(store.hasListeners()).toBe(false);
  });

  it("respects maxRecords and trims oldest records", () => {
    const store = createLogStore({ maxRecords: 3 });
    for (let i = 0; i < 5; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(3);
    expect(snap[0].id).toBe("log-2");
    expect(snap[2].id).toBe("log-4");
  });

  it("keeps records in order once the ring buffer has wrapped several times", () => {
    const store = createLogStore({ maxRecords: 3 });
    for (let i = 0; i < 10; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    expect(store.getSnapshot().map((r) => r.id)).toEqual(["log-7", "log-8", "log-9"]);
  });

  it("defaults to 1000 records", () => {
    const store = createLogStore();
    for (let i = 0; i < 1005; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(1000);
    expect(snap[0].id).toBe("log-5");
  });

  it("clears all records", () => {
    const store = createLogStore();
    store.addRecord(makeRecord());
    store.addRecord(makeRecord());
    store.clear();
    expect(store.getSnapshot()).toEqual([]);
  });

  it("notifies subscribers on clear", async () => {
    const store = createLogStore();
    store.addRecord(makeRecord());
    await flush();
    const listener = vi.fn();
    store.subscribe(listener);
    store.clear();
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("setMaxSize trims records if current count exceeds new max", () => {
    const store = createLogStore({ maxRecords: 10 });
    for (let i = 0; i < 5; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    store.setMaxSize(2);
    const snap = store.getSnapshot();
    expect(snap).toHaveLength(2);
    expect(snap[0].id).toBe("log-3");
    expect(snap[1].id).toBe("log-4");
  });

  it("keeps appending in order after setMaxSize grows the buffer", () => {
    const store = createLogStore({ maxRecords: 2 });
    for (let i = 0; i < 4; i++) {
      store.addRecord(makeRecord({ id: `log-${i}` }));
    }
    store.setMaxSize(4);
    store.addRecord(makeRecord({ id: "log-4" }));
    expect(store.getSnapshot().map((r) => r.id)).toEqual(["log-2", "log-3", "log-4"]);
  });

  it("setMaxSize notifies when trimming occurs", async () => {
    const store = createLogStore({ maxRecords: 10 });
    for (let i = 0; i < 5; i++) {
      store.addRecord(makeRecord());
    }
    await flush();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMaxSize(2);
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("setMaxSize does not notify when no trimming is needed", async () => {
    const store = createLogStore({ maxRecords: 10 });
    store.addRecord(makeRecord());
    await flush();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMaxSize(5);
    await flush();
    expect(listener).not.toHaveBeenCalled();
  });
});
